# Sử dụng image nhỏ gọn của Node.js
FROM node:alpine

# Tạo thư mục làm việc
WORKDIR /usr/src/app

# Copy file cấu hình trước để cache layer
COPY package*.json ./

# Cài đặt dependencies
# RUN npm install

# Copy toàn bộ mã nguồn
COPY . .

# Mở port (Railway tự chọn nhưng ta cần expose)
EXPOSE 8080

# Lệnh chạy server (chạy server.js ở root)
CMD ["node", "server.js"]
