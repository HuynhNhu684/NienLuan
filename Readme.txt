1. Môi trường phát triển
- Frontend: ReactJS (chạy bằng Node.js)
Trình quản lý thư viện: npm
Yêu cầu: Node.js >= 18.x, npm >= 9.x
- Backend: Node.js (ExpressJS)
Các service độc lập (Auth, Appointment, Payment, Notification)
Giao tiếp giữa các service thông qua HTTP và Message Queue

2. Môi trường triển khai
- Docker Desktop: dùng để build và chạy container
- Kubernetes (Kind): tạo cluster Kubernetes cục bộ để triển khai hệ thống microservice
- Helm: quản lý và triển khai các service dưới dạng chart

3. Hướng dẫn cài đặt
  3.1. Cài gói thư viện cho frontend
Cài đặt các gói thư viện cho Frontend (React)
Frontend của dự án được xây dựng bằng ReactJS và sử dụng trình quản lý gói npm.
  Bước 1: Di chuyển vào thư mục frontend
    cd frontend
  Bước 2: Cài đặt các thư viện cần thiết
    npm install
Lệnh này sẽ tự động cài đặt toàn bộ các thư viện được khai báo trong file package.json, bao gồm:
- React
- React Router DOM
- Axios
- Các thư viện UI và các dependency liên quan khác
  Bước 3: Chạy ứng dụng frontend ở môi trường phát triển
    npm run dev
  Sau khi chạy thành công, ứng dụng frontend sẽ hoạt động tại địa chỉ: http://localhost:5173
  3.2. Cài các gói thư viện cho admin
Tương tự như frontend
  3.3. Cài đặt các gói thư viện cho Backend (NodeJS Microservices)
Backend của hệ thống được xây dựng theo kiến trúc Microservice, mỗi service là một ứng dụng NodeJS độc lập.
Các service chính bao gồm (ví dụ):auth-service, appointment-service, payment-service, notification-service
  Bước 1: Di chuyển vào thư mục backend
    cd backend
  Bước 2: Cài đặt thư viện cho từng service
Thực hiện lần lượt cho từng service:
    cd <ten-service>
    cd auth-service
    cd appointment-service
    cd payment-service
    cd notification-service
    npm install
Ví dụ: cd auth-service
      npm install
Lặp lại các bước trên cho các service còn lại trong thư mục backend.
Các thư viện backend sử dụng bao gồm:ExpressJS, Mongoose (MongoDB), JWT (Xác thực), RabbitMQ (amqplib)
Các middleware hỗ trợ khác
  3.4. Chạy Payment Service (Tích hợp PayPal Sandbox)
Payment Service chịu trách nhiệm xử lý thanh toán trực tuyến cho hệ thống đặt lịch khám.
Hệ thống sử dụng PayPal Sandbox để mô phỏng thanh toán (không dùng tiền thật).
a) Chuẩn bị tài khoản PayPal Sandbox
Truy cập trang PayPal Developer:
  https://developer.paypal.com/
Đăng nhập bằng tài khoản PayPal (hoặc tạo mới)
Vào: Dashboard → Sandbox → Accounts
Tạo: 1 tài khoản Sandbox Business, 1 tài khoản Sandbox Personal
Lấy thông tin: Client ID, Secret Key
b) Cấu hình biến môi trường cho Payment Service
Di chuyển vào thư mục payment-service:
  cd backend/payment-service
Mở file .env sửa các dòng sau thay bằng thông tin của mình:
  PAYPAL_API_URL=https://api-m.sandbox.paypal.com
  PAYPAL_CLIENT_ID=Client ID
  PAYPAL_CLIENT_SECRET=Secret Key
c) Cài đặt thư viện và chạy Payment Service
  npm install
  npm run dev
Hoặc: npm start
Nếu thành công sẽ thấy: 
Payment Service running on port 3002
Connected to PayPal Sandbox
  3.5. Chạy Notification Service (RabbitMQ Cloud – Bất đồng bộ)
Notification Service dùng để: 
  - Xử lý tin nhắn bất đồng bộ
  - Gửi thông báo khi: Thanh toán thành công và Đặt lịch khám thành công
Hệ thống sử dụng RabbitMQ Cloud (CloudAMQP).
a) Chuẩn bị RabbitMQ Cloud
Truy cập:
  https://www.cloudamqp.com/
Tạo tài khoản miễn phí
Tạo một instance RabbitMQ (plan Little Lemur – free)
Lấy AMQP URL, ví dụ:
  amqps://username:password@host/vhost
b) Cấu hình biến môi trường cho Notification Service
Di chuyển vào thư mục notification-service:
  cd backend/notification-service
Mở file .env và sửa các dòng sau thay bằng thông tin của mình:
RABBITMQ_URL='AMQP URL của bạn'
c) Cài đặt thư viện và chạy Notification Service
  npm install
  npm run dev
Hoặc: npm start
Nếu chạy thành công:
  Notification Service connected to RabbitMQ
  Waiting for messages...
  3.6. Hướng dẫn buil các service lên Docker hub
- Di chuyển vào trang thư mục backend
  cd backend
- Vào từng service cụ thể
  cd <tên service> Ví dụ: cd auth-service
- Sử dụng lệnh build để tạo ra image: docker build -t <username>/<service name>:<tag> .
Với username là tên tài khoản docker của bạn và service name là tên service bạn muốn build, ví dụ: docker build -t kimngoc20/auth-service:latest . (Với <tag> là phiên bản mới nhất)
  3.7. Hướng dẫn push các service lên Docker Hub
Di chuyển vào trang thư mục backend
  cd backend
- Vào từng service cụ thể
  cd <tên service> Ví dụ: cd auth-service
- Sử dụng lệnh build để tạo ra image: docker push -t <username>/<service name>:<tag>
Với username là tên tài khoản docker của bạn và service name là tên service bạn muốn push, ví dụ: docker push -t kimngoc20/auth-service:latest (Với <tag> là phiên bản mới nhất)
  3.8. Khởi tạo cụm K8s bằng Kind
- Di chuyển vào thư mục microservice
  cd infrastructure\kubernetes\microservice
- Sử dụng lệnh: kind create cluster --config kind-config.yaml (để khởi tạo cụm)
- Sử dụng lệnh: kubectl get node (để kiểm tra trạng thái node)
- Tại thư mục đó: kubectl apply -f namespace.yaml (để khởi tạo namespace cho cụm)
  3.9. Cài Đặt Kong API Gateway bằng Helm chart
  helm repo add kong https://charts.konghq.com
  helm repo update
  helm install kong kong/kong -n kong --create-namespace --set proxy.type=NodePort --set     proxy.http.nodePort=30080 --set proxy.tls.nodePort=30443 --set env.database=off
  3.10. Triển khai các file cấu hình cho dịch vụ
- Di chuyển vào thư mục cấu hình của từng dịch vụ
  cd cd infrastructure\kubernetes\microservice\tên-service
ví dụ: cd infrastructure\kubernetes\microservice\auth-service
- Sử dụng lệnh: kubectl apply -f .
-> Tiếp tục thực hiện với các service còn lại 
  3.11. Cài đặt Giám sát hệ thống với Prometheus và Grafana
  helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
  helm repo update
  helm install prometheus prometheus-community/prometheus --namespace monitoring --create-namespace --set server.service.type=NodePort --set server.service.nodePort=30090 --set alertmanager.enabled=false
  kubectl edit configmap prometheus-server -n monitoring
  Dán nội dung sau vào: 

- job_name: auth-service
  static_configs:
  - targets: ['auth-service.microservices.svc.cluster.local:3000']

  kubectl rollout restart deployment prometheus-server -n monitoring
  kubectl port-forward svc/prometheus-server -n monitoring 9090:80
  helm repo add grafana https://grafana.github.io/helm-charts
  helm repo update
  helm install grafana grafana/grafana --namespace monitoring --create-namespace --set service.type=NodePort --set service.nodePort=30091 --set persistence.enabled=false

Truy xuất mật khẩu admin của Grafana
  kubectl get secret --namespace monitoring grafana -o jsonpath="{.data.admin-password}" | ForEach-Object { [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($_)) }

  kubectl port-forward svc/grafana -n monitoring 3333:80
- Truy cập: http://localhost:3333
-> Đây là giao diện login của Grafana đăng nhập với username là admin mật khẩu đã truy xuất phía trên
- Khi đã vào được giao diện kết nối với dữ liệu Prometheus đã thu thập và import dashboard bạn mong muốn
