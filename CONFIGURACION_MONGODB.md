# Configuración de MongoDB Atlas

## ❌ Error Actual
```
bad auth : authentication failed
```

## ✅ Solución

### 1. Verificar Usuario y Contraseña
1. Ve a https://cloud.mongodb.com/
2. Inicia sesión en tu cuenta
3. Ve a "Database Access" en el menú lateral
4. Verifica que el usuario `Fabiana1504` existe
5. Si no existe, créalo con la contraseña `zTOAetu7QtneNH9X`

### 2. Verificar Permisos del Usuario
El usuario debe tener:
- **Database User Privileges**: `Read and write to any database`
- **Built-in Role**: `Atlas admin` o `Read and write to any database`

### 3. Verificar Whitelist de IP
1. Ve a "Network Access" en el menú lateral
2. Asegúrate de que tu IP esté en la lista
3. O agrega `0.0.0.0/0` para permitir todas las IPs (solo para desarrollo)

### 4. Verificar URL de Conexión
La URL debe ser exactamente:
```
mongodb+srv://Fabiana1504:zTOAetu7QtneNH9X@cluster0.a08e3ro.mongodb.net/school-tasks?retryWrites=true&w=majority&appName=Cluster0
```

### 5. Probar Conexión
Una vez configurado, ejecuta:
```bash
cd backend
node test-connection-fixed.js
```

Deberías ver:
```
✅ ¡Conexión exitosa a MongoDB Atlas!
```

## 🔧 Alternativa: Crear Nuevo Usuario
Si el usuario actual no funciona:
1. Ve a "Database Access"
2. Crea un nuevo usuario con:
   - Username: `school-tasks-user`
   - Password: `password123` (más simple)
   - Role: `Read and write to any database`
3. Actualiza la URL en el código con el nuevo usuario
