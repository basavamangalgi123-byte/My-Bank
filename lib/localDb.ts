import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DB_PATH = path.join(process.cwd(), 'local_db.json');

interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    phone: string;
    balance: number;
    createdAt: string;
}

interface Database {
    users: User[];
}

function getDb(): Database {
    try {
        if (fs.existsSync(DB_PATH)) {
            const data = fs.readFileSync(DB_PATH, 'utf-8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error reading local DB:', error);
    }
    return { users: [] };
}

function saveDb(db: Database): void {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    } catch (error) {
        console.error('Error saving local DB:', error);
    }
}

export const localDb = {
    async createUser(userData: { name: string; email: string; password: string; phone: string }): Promise<User> {
        const db = getDb();

        // Check if user exists
        const existing = db.users.find(u => u.email === userData.email);
        if (existing) {
            throw new Error('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const user: User = {
            id: Date.now().toString(),
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            phone: userData.phone,
            balance: 1000,
            createdAt: new Date().toISOString()
        };

        db.users.push(user);
        saveDb(db);

        return user;
    },

    async findUserByEmail(email: string): Promise<User | null> {
        const db = getDb();
        return db.users.find(u => u.email === email) || null;
    },

    async validatePassword(user: User, password: string): Promise<boolean> {
        return bcrypt.compare(password, user.password);
    },

    async updateBalance(userId: string, newBalance: number): Promise<void> {
        const db = getDb();
        const user = db.users.find(u => u.id === userId);
        if (user) {
            user.balance = newBalance;
            saveDb(db);
        }
    }
};