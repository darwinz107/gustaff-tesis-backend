# Usamos Node 18 (versión estable)
FROM node:20-alpine

# Carpeta de trabajo dentro del contenedor
WORKDIR /guss-app

# Copiamos archivos de dependencias
COPY package*.json ./

# Instalamos las librerías
RUN npm install

# Copiamos todo el código del backend
COPY . .

# Compilamos TypeScript a JavaScript
RUN npm run build

# Exponemos el puerto 3000
EXPOSE 3000

# Comando para arrancar en modo producción
CMD ["npm", "run", "start:prod"]