// server.js

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar o body-parser para lidar com dados de requisições POST
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir arquivos estáticos do frontend (HTML, CSS, JS) a partir da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Caminho para o "banco de dados" em arquivo (simulação)
const dbPath = path.join(__dirname, 'data.json');

// Função para ler o banco de dados (simulação)
const readDB = () => {
    try {
        if (!fs.existsSync(dbPath)) {
            return { users: [] };
        }
        const data = fs.readFileSync(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erro ao ler data.json:', error);
        return { users: [] };
    }
};

// Função para salvar o banco de dados (simulação)
const saveDB = (db) => {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
};

// ===================================
// Endpoints da API
// ===================================

// Rota de registro de usuário
app.post('/api/register', (req, res) => {
    const { registerName, registerEmail, registerPassword } = req.body;
    const db = readDB();

    // Simulação: verificar se o e-mail já está cadastrado
    if (db.users.find(u => u.email === registerEmail)) {
        return res.status(409).json({ success: false, message: 'Este e-mail já está cadastrado.' });
    }

    const newUser = {
        id: db.users.length + 1,
        name: registerName,
        email: registerEmail,
        password: registerPassword, // Em um ambiente real, NUNCA armazene senhas em texto puro! Use uma biblioteca como bcrypt.
        earnings: {
            today: 0.00,
            month: 0.00,
            total: 0.00
        }
    };

    db.users.push(newUser);
    saveDB(db);

    // Resposta de sucesso
    res.json({ success: true, message: 'Usuário registrado com sucesso!', user: newUser });
});

// Rota de login
app.post('/api/login', (req, res) => {
    const { loginEmail, loginPassword } = req.body;
    const db = readDB();

    // Simulação: encontrar o usuário e validar a senha
    const user = db.users.find(u => u.email === loginEmail && u.password === loginPassword);

    if (user) {
        // Em um ambiente real, você geraria um token de sessão (JWT)
        // para manter o usuário logado de forma segura
        res.json({ success: true, message: 'Login bem-sucedido!', user: user });
    } else {
        res.status(401).json({ success: false, message: 'E-mail ou senha incorretos.' });
    }
});

// Rota para atualizar ganhos do usuário
app.post('/api/earn', (req, res) => {
    const { email, amount } = req.body;
    const db = readDB();
    const userIndex = db.users.findIndex(u => u.email === email);

    if (userIndex !== -1) {
        db.users[userIndex].earnings.today = (db.users[userIndex].earnings.today || 0) + amount;
        db.users[userIndex].earnings.month = (db.users[userIndex].earnings.month || 0) + amount;
        db.users[userIndex].earnings.total = (db.users[userIndex].earnings.total || 0) + amount;
        saveDB(db);

        res.json({ success: true, message: 'Ganhos atualizados!', earnings: db.users[userIndex].earnings });
    } else {
        res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    }
});

// Rota principal para servir o index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
