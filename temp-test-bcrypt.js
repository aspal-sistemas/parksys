import bcrypt from 'bcryptjs';

// Hash almacenado en la base de datos
const storedHash = '$2b$10$dM6rTk6noLmnnlR4W/IKe.2/lQudvQC8adMcnbcMzeDPN8jxFyPpS';
const password = 'temp123';

console.log('Testing bcrypt comparison...');
console.log('Password:', password);
console.log('Stored hash:', storedHash);

const result = bcrypt.compareSync(password, storedHash);
console.log('Comparison result:', result);

// Test creating a new hash
const newHash = bcrypt.hashSync(password, 10);
console.log('New hash:', newHash);
const newResult = bcrypt.compareSync(password, newHash);
console.log('New hash comparison:', newResult);