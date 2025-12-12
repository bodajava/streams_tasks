const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

// تأكد أن اسم الملف هو 'user.json' كما في الكود الأصلي الذي أرسلته
const JSON_FILE_PATH = path.join(__dirname, "user.json"); 
const PORT = 3000;

// --------------------------
// Read users (Utility)
// --------------------------
function readUsers() {
  return new Promise((resolve, reject) => {
    fs.readFile(JSON_FILE_PATH, "utf8", (err, data) => {
      if (err) {
        if (err.code === "ENOENT") return resolve([]);
        return reject(err);
      }

      try {
        const users = JSON.parse(data);
        resolve(users);
      } catch (err) {
        reject(err);
      }
    });
  });
}

// --------------------------
// Write users (Utility)
// --------------------------
function writeUsers(users) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(users, null, 4);

    fs.writeFile(JSON_FILE_PATH, data, "utf8", (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

// --------------------------
// Send Response (Utility)
// --------------------------
function sendResponse(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

// --------------------------------------------------
// 1. POST /user: Add new user (with email check)
// --------------------------------------------------
async function handlePostUser(req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    try {
      const newUser = JSON.parse(body);
      const { name, age, email } = newUser;

      if (!name || !age || !email) {
        return sendResponse(res, 400, { message: 'Missing required fields: name, age, email' });
      }

      let users = await readUsers();

      // التحقق من تكرار البريد الإلكتروني
      if (users.some(user => user.email === email)) {
        return sendResponse(res, 409, { message: 'User with this email already exists.' });
      }

      // توليد ID جديد
      const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
      const userToAdd = { id: newId, name, age: parseInt(age), email };
      
      users.push(userToAdd);
      await writeUsers(users);

      sendResponse(res, 201, userToAdd);
    } catch (err) {
      sendResponse(res, 400, { error: "Invalid JSON or Internal Server Error." });
    }
  });
}

// --------------------------------------------------
// 2. PATCH /user/:id: Update user by ID
// --------------------------------------------------
async function handlePatchUser(req, res, userId) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });

    req.on('end', async () => {
        try {
            const updates = JSON.parse(body);
            const id = parseInt(userId);

            let users = await readUsers();
            const userIndex = users.findIndex(u => u.id === id);

            if (userIndex === -1) {
                return sendResponse(res, 404, { message: `User with ID ${id} not found.` });
            }

            const userToUpdate = users[userIndex];

            if (updates.name) userToUpdate.name = updates.name;
            if (updates.age) userToUpdate.age = parseInt(updates.age);
            
            if (updates.email && updates.email !== userToUpdate.email) {
                if (users.some((user, index) => index !== userIndex && user.email === updates.email)) {
                    return sendResponse(res, 409, { message: 'This email is already taken by another user.' });
                }
                userToUpdate.email = updates.email;
            }

            await writeUsers(users);

            sendResponse(res, 200, userToUpdate);
        } catch (error) {
            sendResponse(res, 400, { message: 'Invalid JSON or Internal Server Error' });
        }
    });
}

// --------------------------------------------------
// 3. DELETE /user/:id: Delete user by ID
// --------------------------------------------------
async function handleDeleteUser(req, res, userId) {
    try {
        const id = parseInt(userId);
        let users = await readUsers();

        const initialLength = users.length;
        const updatedUsers = users.filter(u => u.id !== id);

        if (updatedUsers.length === initialLength) {
            return sendResponse(res, 404, { message: `User with ID ${id} not found.` });
        }

        await writeUsers(updatedUsers);

        sendResponse(res, 200, { message: `User with ID ${id} deleted successfully.` });
    } catch (error) {
        sendResponse(res, 500, { message: 'Internal Server Error' });
    }
}

// --------------------------------------------------
// 4. GET /user: Get all users
// --------------------------------------------------
async function handleGetUsers(req, res) {
    try {
        const users = await readUsers();
        sendResponse(res, 200, users);
    } catch (error) {
        sendResponse(res, 500, { message: 'Internal Server Error' });
    }
}

// --------------------------------------------------
// 5. GET /user/:id: Get user by ID
// --------------------------------------------------
async function handleGetUserById(req, res, userId) {
    try {
        const id = parseInt(userId);
        const users = await readUsers();
        const user = users.find(u => u.id === id);

        if (!user) {
            return sendResponse(res, 404, { message: `User with ID ${id} not found.` });
        }
        sendResponse(res, 200, user);
    } catch (error) {
        sendResponse(res, 500, { message: 'Internal Server Error' });
    }
}


// --------------------------
// Create Server (Router)
// --------------------------
const server = http.createServer(async (req, res) => {
    const { method, url } = req;
    
    // تقسيم الـ URL لتحديد المسار والـ ID
    const parts = url.split('/').filter(p => p.length > 0);

    if (parts[0] === 'user') {
        if (parts.length === 1) { // /user
            if (method === 'GET') {
                await handleGetUsers(req, res);
            } else if (method === 'POST') {
                await handlePostUser(req, res);
            } else {
                sendResponse(res, 405, { message: 'Method Not Allowed' });
            }
        } else if (parts.length === 2) { // /user/:id
            const userId = parts[1];
            if (method === 'GET') {
                await handleGetUserById(req, res, userId);
            } else if (method === 'PATCH') {
                await handlePatchUser(req, res, userId);
            } else if (method === 'DELETE') {
                await handleDeleteUser(req, res, userId);
            } else {
                sendResponse(res, 405, { message: 'Method Not Allowed' });
            }
        } else {
            sendResponse(res, 404, { message: 'Not Found' });
        }
    } else {
        sendResponse(res, 404, { message: 'Not Found' });
    }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});