# usamos la imagen oficial de Node.js como base

FROM node:18-alpine

# establecemos el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app 

# copiamos el archivo package.json y package-lock.json al contenedor
COPY package*.json ./

# instalamos las dependencias del proyecto
RUN npm install

# copiamos el resto de los archivos del proyecto al contenedor
#incluimos server.js, la carpeta public y demas archivos necesarios
COPY . ./

# exponemos el puerto en el que la aplicación escuchará "3000"
# nos sirve para que la API sea accesible desde fuera del contenedor
EXPOSE 3000

# definimos el comando para iniciar la aplicación Node.js
# se ejecutara cuando el contenedor inicie
CMD ["node", "server.js"]
