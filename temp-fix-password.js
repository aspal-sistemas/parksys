import bcrypt from 'bcryptjs';

// Generar hash para contraseña "temp123"
const password = 'temp123';
const hash = bcrypt.hashSync(password, 10);

console.log('Password:', password);
console.log('Hash:', hash);