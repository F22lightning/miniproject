-- =============================================
-- ระบบ: Kitchen Buddy (KDS & SOP System)
-- รายละเอียด: โครงสร้างฐานข้อมูลภาษาไทยอ้างอิงจาก ER Diagram (Physical Design)
-- =============================================

-- 1. สร้างตารางหมวดหมู่
CREATE TABLE หมวดหมู่ (
    ID_หมวดหมู่ INT AUTO_INCREMENT,
    ชื่อหมวดหมู่ VARCHAR(100) NOT NULL,
    CONSTRAINT PK_หมวดหมู่ PRIMARY KEY (ID_หมวดหมู่)
);

-- 2. สร้างตารางรายการเมนู
CREATE TABLE รายการเมนู (
    ID_เมนู INT AUTO_INCREMENT,
    ID_หมวดหมู่ INT NOT NULL,
    ชื่อเมนู VARCHAR(150) NOT NULL,
    CONSTRAINT PK_เมนู PRIMARY KEY (ID_เมนู),
    CONSTRAINT FK_หมวดหมู่_เมนู FOREIGN KEY (ID_หมวดหมู่) REFERENCES หมวดหมู่(ID_หมวดหมู่) ON DELETE CASCADE
);

-- 3. สร้างตารางคู่มือการทำ
CREATE TABLE คู่มือการทำ (
    ID_คู่มือ INT AUTO_INCREMENT,
    ID_เมนู INT UNIQUE NOT NULL,
    วิธีการทำ_สูตร TEXT,
    ลิงก์รูปภาพประกอบ VARCHAR(255),
    เวลามาตรฐาน_นาที INT,
    CONSTRAINT PK_คู่มือ PRIMARY KEY (ID_คู่มือ),
    CONSTRAINT FK_เมนู_คู่มือ FOREIGN KEY (ID_เมนู) REFERENCES รายการเมนู(ID_เมนู) ON DELETE CASCADE
);

-- 4. สร้างตารางรายการสั่งซื้อ_Order
CREATE TABLE รายการสั่งซื้อ_Order (
    ID_ออเดอร์ INT AUTO_INCREMENT,
    คิวที่ INT NOT NULL,
    วันที่เวลา_สั่ง DATETIME DEFAULT CURRENT_TIMESTAMP,
    สถานะออเดอร์ VARCHAR(50) NOT NULL DEFAULT 'รอคิว', -- รอคิว, กำลังทำ, เสร็จสิ้น
    เวลาที่เริ่มทำ DATETIME NULL,
    เวลาที่เสร็จสิ้น DATETIME NULL,
    CONSTRAINT PK_ออเดอร์ PRIMARY KEY (ID_ออเดอร์)
);

-- 5. สร้างตารางรายละเอียดออเดอร์
CREATE TABLE รายละเอียดออเดอร์ (
    ID_รายละเอียด INT AUTO_INCREMENT,
    ID_ออเดอร์ INT NOT NULL,
    ID_เมนู INT NOT NULL,
    จำนวน INT NOT NULL DEFAULT 1,
    หมายเหตุ_คำสั่งพิเศษ TEXT NULL,
    CONSTRAINT PK_รายละเอียด PRIMARY KEY (ID_รายละเอียด),
    CONSTRAINT FK_ออเดอร์_รายละเอียด FOREIGN KEY (ID_ออเดอร์) REFERENCES รายการสั่งซื้อ_Order(ID_ออเดอร์) ON DELETE CASCADE,
    CONSTRAINT FK_เมนู_รายละเอียด FOREIGN KEY (ID_เมนู) REFERENCES รายการเมนู(ID_เมนู) ON DELETE CASCADE
);