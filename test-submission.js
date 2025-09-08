const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testSubmission() {
  try {
    console.log('🔄 Probando creación de entrega...');
    
    // Primero hacer login como estudiante
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'estudiante@test.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso como estudiante');
    
    // Obtener tareas asignadas
    const tasksResponse = await axios.get('http://localhost:3001/api/tasks', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const tasks = tasksResponse.data.tasks || [];
    console.log('📝 Tareas encontradas:', tasks.length);
    
    if (tasks.length === 0) {
      console.log('❌ No hay tareas asignadas al estudiante');
      return;
    }
    
    const task = tasks[0];
    console.log('📋 Usando tarea:', task.title);
    
    // Crear un archivo PDF de prueba
    const testPdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n174\n%%EOF';
    fs.writeFileSync('test-submission.pdf', testPdfContent);
    
    // Crear la entrega
    const formData = new FormData();
    formData.append('file', fs.createReadStream('test-submission.pdf'));
    formData.append('taskId', task.id);
    formData.append('comments', 'Esta es una entrega de prueba');
    
    const response = await axios.post('http://localhost:3001/api/submissions', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      }
    });
    
    console.log('✅ Entrega creada exitosamente:', response.data);
    
    // Limpiar archivo de prueba
    fs.unlinkSync('test-submission.pdf');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.error('❌ Full error:', error);
    if (error.response?.data?.stack) {
      console.error('Stack trace:', error.response.data.stack);
    }
  }
}

testSubmission();
