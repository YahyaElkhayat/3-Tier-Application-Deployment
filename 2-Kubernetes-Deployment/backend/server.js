const express = require('express');
const mysql = require('mysql2/promise'); // Use mysql2/promise for async/await support
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const { createPool } = require('mysql2/promise');

const app = express();
app.use(express.json());
app.use(cors());

console.log("DB Config:", {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ? "*****" : undefined,
  database: process.env.DB_NAME || process.env.MYSQL_DATABASE,
  port: process.env.DB_PORT
});

// Create database connection pool
const db = createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'school_user',
    password: process.env.DB_PASSWORD || 'password123',
    database: process.env.DB_NAME || process.env.MYSQL_DATABASE || 'school',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Database initialization function - runs automatically on startup
async function initializeDatabase() {
    try {
        console.log('Initializing database and tables...');
        
        // Create connection without specifying database first to create it
        const rootConnection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'school_user',
            password: process.env.DB_PASSWORD || 'password123',
            port: process.env.DB_PORT || 3306
        });

        // Create database if it doesn't exist
        const dbName = process.env.DB_NAME || process.env.MYSQL_DATABASE || 'school';
        await rootConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        await rootConnection.execute(`USE \`${dbName}\``);
        console.log(`Database '${dbName}' created/verified`);
        
        // Create tables
        await createTables(rootConnection);
        
        // Insert sample data if tables are empty
        await insertSampleData(rootConnection);
        
        await rootConnection.end();
        console.log('Database initialization completed successfully');
        
    } catch (error) {
        console.error('Database initialization failed:', error.message);
        // Continue anyway - some cloud environments have delays
    }
}

// Create tables function
async function createTables(connection) {
    try {
        // Create student table
        const createStudentTable = `
            CREATE TABLE IF NOT EXISTS student (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                roll_number VARCHAR(50),
                class VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `;
        
        await connection.execute(createStudentTable);
        console.log('Student table created/verified');
        
        // Create teacher table
        const createTeacherTable = `
            CREATE TABLE IF NOT EXISTS teacher (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                subject VARCHAR(255),
                class VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `;
        
        await connection.execute(createTeacherTable);
        console.log('Teacher table created/verified');
        
    } catch (error) {
        console.error('Error creating tables:', error.message);
        throw error;
    }
}

// Insert sample data function
async function insertSampleData(connection) {
    try {
        // Check if student table has data
        const [studentRows] = await connection.execute('SELECT COUNT(*) as count FROM student');
        const studentCount = studentRows[0].count;
        
        if (studentCount === 0) {
            console.log('Inserting sample student data...');
            const insertStudents = `
                INSERT INTO student (name, roll_number, class) VALUES
                ('John Doe', '001', '10A'),
                ('Jane Smith', '002', '10B'),
                ('Bob Johnson', '003', '9A')
            `;
            await connection.execute(insertStudents);
            console.log('Sample student data inserted');
        } else {
            console.log(`Student table already has ${studentCount} records`);
        }
        
        // Check if teacher table has data
        const [teacherRows] = await connection.execute('SELECT COUNT(*) as count FROM teacher');
        const teacherCount = teacherRows[0].count;
        
        if (teacherCount === 0) {
            console.log('Inserting sample teacher data...');
            const insertTeachers = `
                INSERT INTO teacher (name, subject, class) VALUES
                ('Prof. Wilson', 'Mathematics', '10A'),
                ('Dr. Brown', 'Science', '9A'),
                ('Ms. Davis', 'English', '10B')
            `;
            await connection.execute(insertTeachers);
            console.log('Sample teacher data inserted');
        } else {
            console.log(`Teacher table already has ${teacherCount} records`);
        }
        
    } catch (error) {
        console.error('Error inserting sample data:', error.message);
        // Don't throw - sample data insertion failure shouldn't stop the app
    }
}

// Test database connection and initialize
async function testConnection() {
    try {
        await initializeDatabase();
    } catch (error) {
        console.error('Database connection failed:', error.message);
        // In production, you might want to implement retry logic here
        console.log('Continuing without database initialization - will retry on first request');
    }
}

// Test connection on startup
testConnection();

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Handle the error appropriately, e.g., log it or send an alert
});

// Centralized database connection handling
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await db.end();
    process.exit();
});

// Helper function to ensure database is ready
async function ensureDatabaseReady() {
    try {
        const connection = await db.getConnection();
        connection.release();
        return true;
    } catch (error) {
        console.error('Database not ready, attempting to initialize...');
        await initializeDatabase();
        return true;
    }
}

const getLastStudentID = async () => {
    try {
        const [result] = await db.query('SELECT MAX(id) AS lastID FROM student');
        const lastID = result[0].lastID || 0;
        return lastID;
    } catch (error) {
        console.error('Error getting last student ID:', error);
        // If table doesn't exist, try to initialize database
        await ensureDatabaseReady();
        throw error;
    }
};

const getLastteacherID = async () => {
    try {
        const [result] = await db.query('SELECT MAX(id) AS lastID FROM teacher');
        const lastID = result[0].lastID || 0;
        return lastID;
    } catch (error) {
        console.error('Error getting last teacher ID:', error);
        // If table doesn't exist, try to initialize database
        await ensureDatabaseReady();
        throw error;
    }
};

app.get('/', async (req, res) => {
    try {
        // Ensure database is ready before querying
        await ensureDatabaseReady();
        
        // Fetch data from the student table
        const [data] = await db.query("SELECT * FROM student");
        return res.json({ 
            message: "From Backend!!!", 
            studentData: data,
            timestamp: new Date().toISOString(),
            status: "Database connected successfully"
        });
    } catch (error) {
        console.error('Error fetching student data:', error);
        return res.status(500).json({ 
            error: 'Error fetching student data',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

app.get('/student', async (req, res) => {
    try {
        await ensureDatabaseReady();
        const [data] = await db.query("SELECT * FROM student ORDER BY id");
        return res.json(data);
    } catch (error) {
        console.error('Error fetching students:', error);
        return res.status(500).json({ error: 'Error fetching students', message: error.message });
    }
});

app.get('/teacher', async (req, res) => {
    try {
        await ensureDatabaseReady();
        const [data] = await db.query("SELECT * FROM teacher ORDER BY id");
        return res.json(data);
    } catch (error) {
        console.error('Error fetching teachers:', error);
        return res.status(500).json({ error: 'Error fetching teachers', message: error.message });
    }
});

app.post('/addstudent', async (req, res) => {
    try {
        await ensureDatabaseReady();
        
        const lastStudentID = await getLastStudentID();
        const nextStudentID = lastStudentID + 1;

        const studentData = {
            id: nextStudentID,
            name: req.body.name,
            roll_number: req.body.rollNo,
            class: req.body.class,
        };

        const sql = `INSERT INTO student (id, name, roll_number, class) VALUES (?, ?, ?, ?)`;
        await db.query(sql, [studentData.id, studentData.name, studentData.roll_number, studentData.class]);
        return res.json({ 
            message: 'Student added successfully', 
            student: studentData,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error adding student:', error);
        return res.status(500).json({ error: 'Error adding student', message: error.message });
    }
});

app.post('/addteacher', async (req, res) => {
    try {
        await ensureDatabaseReady();
        
        const lastteacherID = await getLastteacherID();
        const nextteacherID = lastteacherID + 1;

        const TeacherData = {
            id: nextteacherID,
            name: req.body.name,
            subject: req.body.subject,
            class: req.body.class,
        };

        const sql = `INSERT INTO teacher (id, name, subject, class) VALUES (?, ?, ?, ?)`;
        await db.query(sql, [TeacherData.id, TeacherData.name, TeacherData.subject, TeacherData.class]);
        return res.json({ 
            message: 'Teacher added successfully', 
            teacher: TeacherData,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error adding teacher:', error);
        return res.status(500).json({ error: 'Error adding teacher', message: error.message });
    }
});

app.delete('/student/:id', async (req, res) => {
    const studentId = req.params.id;
    const sqlDelete = 'DELETE FROM student WHERE id = ?';
    const sqlSelect = 'SELECT id FROM student ORDER BY id';

    try {
        await ensureDatabaseReady();
        
        await db.query(sqlDelete, [studentId]);

        const [rows] = await db.query(sqlSelect);

        const updatePromises = rows.map(async (row, index) => {
            const newId = index + 1;
            await db.query('UPDATE student SET id = ? WHERE id = ?', [newId, row.id]);
        });

        await Promise.all(updatePromises);
        return res.json({ 
            message: 'Student deleted successfully',
            deletedId: studentId,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error deleting student:', error);
        return res.status(500).json({ error: 'Error deleting student', message: error.message });
    }
});

app.delete('/teacher/:id', async (req, res) => {
    const teacherID = req.params.id;
    const sqlDelete = 'DELETE FROM teacher WHERE id = ?';
    const sqlSelect = 'SELECT id FROM teacher ORDER BY id';

    try {
        await ensureDatabaseReady();
        
        await db.query(sqlDelete, [teacherID]);

        const [rows] = await db.query(sqlSelect);

        const updatePromises = rows.map(async (row, index) => {
            const newId = index + 1;
            await db.query('UPDATE teacher SET id = ? WHERE id = ?', [newId, row.id]);
        });

        await Promise.all(updatePromises);
        return res.json({ 
            message: 'Teacher deleted successfully',
            deletedId: teacherID,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error deleting teacher:', error);
        return res.status(500).json({ error: 'Error deleting teacher', message: error.message });
    }
});

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const connection = await db.getConnection();
        connection.release();
        res.json({ 
            status: 'healthy', 
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({ 
            status: 'unhealthy', 
            database: 'disconnected',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

app.listen(3500, () => {
    console.log("Server listening on Port 3500");
    console.log("Health check available at: http://localhost:3500/health");
});