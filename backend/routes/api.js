const express = require('express');
const router = express.Router();
const db = require('../db');

// 1. Get all categories
router.get('/categories', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM หมวดหมู่');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 2. Get all menus with their category names
router.get('/menus', async (req, res) => {
    try {
        const query = `
            SELECT m.ID_เมนู, m.ชื่อเมนู, c.ชื่อหมวดหมู่, c.ID_หมวดหมู่ 
            FROM รายการเมนู m 
            JOIN หมวดหมู่ c ON m.ID_หมวดหมู่ = c.ID_หมวดหมู่
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 3. Get cooking guide for a specific menu
router.get('/menus/:id/guide', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM คู่มือการทำ WHERE ID_เมนู = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Guide not found for this menu' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 4. Get active orders (for Kitchen Display)
router.get('/orders', async (req, res) => {
    try {
        const query = `
            SELECT o.ID_ออเดอร์, o.คิวที่, o.วันที่เวลา_สั่ง, o.สถานะออเดอร์, o.เวลาที่เริ่มทำ, o.เวลาที่เสร็จสิ้น,
                   d.ID_รายละเอียด, d.จำนวน, d.หมายเหตุ_คำสั่งพิเศษ, m.ชื่อเมนู, m.ID_เมนู
            FROM รายการสั่งซื้อ_Order o
            JOIN รายละเอียดออเดอร์ d ON o.ID_ออเดอร์ = d.ID_ออเดอร์
            JOIN รายการเมนู m ON d.ID_เมนู = m.ID_เมนู
            WHERE o.สถานะออเดอร์ IN ('รอคิว', 'กำลังทำ')
            ORDER BY o.คิวที่ ASC
        `;
        const [rows] = await db.query(query);

        // Group details by order
        const ordersMap = new Map();
        rows.forEach(row => {
            if (!ordersMap.has(row.ID_ออเดอร์)) {
                ordersMap.set(row.ID_ออเดอร์, {
                    ID_ออเดอร์: row.ID_ออเดอร์,
                    คิวที่: row.คิวที่,
                    วันที่เวลา_สั่ง: row.วันที่เวลา_สั่ง,
                    สถานะออเดอร์: row.สถานะออเดอร์,
                    เวลาที่เริ่มทำ: row.เวลาที่เริ่มทำ,
                    เวลาที่เสร็จสิ้น: row.เวลาที่เสร็จสิ้น,
                    items: []
                });
            }
            ordersMap.get(row.ID_ออเดอร์).items.push({
                ID_รายละเอียด: row.ID_รายละเอียด,
                ID_เมนู: row.ID_เมนู,
                ชื่อเมนู: row.ชื่อเมนู,
                จำนวน: row.จำนวน,
                หมายเหตุ_คำสั่งพิเศษ: row.หมายเหตุ_คำสั่งพิเศษ
            });
        });

        res.json(Array.from(ordersMap.values()));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 5. Create a new order (from Cashier)
router.post('/orders', async (req, res) => {
    const { คิวที่, items } = req.body;
    // items should be an array of: { ID_เมนู, จำนวน, หมายเหตุ_คำสั่งพิเศษ }

    if (!คิวที่ || !items || !items.length) {
        return res.status(400).json({ message: 'Invalid order data' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Insert into tborder
        const [orderResult] = await connection.query(
            'INSERT INTO รายการสั่งซื้อ_Order (คิวที่, สถานะออเดอร์) VALUES (?, ?)',
            [คิวที่, 'รอคิว']
        );
        const orderid = orderResult.insertId;

        // Insert into tborderdetail
        for (const item of items) {
            await connection.query(
                'INSERT INTO รายละเอียดออเดอร์ (ID_ออเดอร์, ID_เมนู, จำนวน, หมายเหตุ_คำสั่งพิเศษ) VALUES (?, ?, ?, ?)',
                [orderid, item.ID_เมนู, item.จำนวน, item.หมายเหตุ_คำสั่งพิเศษ || null]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Order created', ID_ออเดอร์: orderid });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        connection.release();
    }
});

// 6. Update order status (by Chef)
router.put('/orders/:id/status', async (req, res) => {
    const { status } = req.body; // 'กำลังทำ' or 'เสร็จสิ้น'
    const validStatuses = ['รอคิว', 'กำลังทำ', 'เสร็จสิ้น'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        let query = 'UPDATE รายการสั่งซื้อ_Order SET สถานะออเดอร์ = ?';
        const params = [status];

        if (status === 'กำลังทำ') {
            query += ', เวลาที่เริ่มทำ = CURRENT_TIMESTAMP';
        } else if (status === 'เสร็จสิ้น') {
            query += ', เวลาที่เสร็จสิ้น = CURRENT_TIMESTAMP';
        }

        query += ' WHERE ID_ออเดอร์ = ?';
        params.push(req.params.id);

        const [result] = await db.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json({ message: 'Order status updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
