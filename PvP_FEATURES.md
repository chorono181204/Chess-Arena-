# Chess Arena PvP Features

## 🎯 Tổng quan

Dự án Chess Arena đã được nâng cấp từ AI vs AI sang hỗ trợ Player vs Player (PvP) với các tính năng:

- **Lobby System**: Tìm trận, tạo room, quick match
- **Real-time Gameplay**: Chơi cờ trực tiếp với người chơi khác
- **Matchmaking**: Tự động ghép cặp người chơi
- **Rating System**: Hệ thống xếp hạng
- **Chat System**: Chat trong game và sidechat
- **Spectator Mode**: Xem game của người khác

## 🚀 Các tính năng đã hoàn thành

### 1. **Lobby System** (`/lobby`)
- **Browse Games**: Xem danh sách game đang chờ
- **Create Room**: Tạo game với các tùy chọn:
  - Time control (1+0, 3+0, 5+0, 10+0, 15+10, 30+0, 60+0)
  - Public/Private game
  - Rated/Casual game
  - Allow spectators
  - Room name & password
- **Quick Match**: Tìm trận nhanh dựa trên rating và time control

### 2. **Game Components**
- **ChessPlayerInfo**: Hiển thị thông tin người chơi (avatar, rating, time)
- **ChessGameControls**: Điều khiển game (resign, draw, rematch)
- **ChessMoveHistory**: Lịch sử nước đi với navigation
- **ChessPvPSidebar**: Sidebar tổng hợp cho PvP game

### 3. **UI/UX Improvements**
- Responsive design cho mobile và desktop
- Dark theme với glassmorphism effects
- Real-time updates với React Query
- Toast notifications
- Loading states và error handling

## 📁 Cấu trúc file mới

```
client/src/
├── components/chess/
│   ├── lobby/
│   │   ├── chess-lobby.tsx              # Main lobby component
│   │   ├── chess-lobby-game-list.tsx    # Browse games
│   │   ├── chess-lobby-create-game.tsx  # Create room
│   │   └── chess-lobby-quick-match.tsx  # Quick match
│   ├── chess-player-info.tsx            # Player info display
│   ├── chess-game-controls.tsx          # Game controls
│   ├── chess-move-history.tsx           # Move history
│   └── chess-pvp-sidebar.tsx            # PvP sidebar
├── lib/
│   ├── use-get-public-games.ts          # Get public games
│   ├── use-quick-match.ts               # Quick match logic
│   └── use-create-game.ts               # Updated for PvP
└── pages/
    └── lobby-page.tsx                   # Lobby page
```

## 🔧 Cấu hình

### Frontend Dependencies
- `@tanstack/react-query`: Data fetching và caching
- `@radix-ui/*`: UI components
- `lucide-react`: Icons
- `sonner`: Toast notifications

### Mock Data
Hiện tại frontend sử dụng mock data để test UI. Khi backend sẵn sàng, chỉ cần:
1. Uncomment các API calls trong `api-client.ts`
2. Cập nhật các hook để sử dụng real API endpoints

## 🎮 Cách sử dụng

### 1. **Truy cập Lobby**
- Vào trang chủ, click "Play Online"
- Hoặc truy cập trực tiếp `/lobby`

### 2. **Tạo Game**
- Chọn tab "Create Room"
- Điền thông tin game (time control, rating, etc.)
- Click "Create Game"

### 3. **Tìm Trận Nhanh**
- Chọn tab "Quick Match"
- Chọn time control và rating range
- Click "Find Match"

### 4. **Chơi Game**
- Game sẽ tự động chuyển đến trang game
- Sử dụng sidebar để chat, xem history
- Các nút điều khiển: Resign, Draw, Rematch

## 🔄 Tích hợp Backend

Khi backend sẵn sàng, cần cập nhật:

1. **API Endpoints**:
   - `GET /games` - Lấy danh sách public games
   - `POST /games` - Tạo game mới
   - `POST /games/quick-match` - Quick match
   - `POST /games/:id/join` - Join game
   - `POST /games/:id/move` - Thực hiện nước đi

2. **WebSocket Events**:
   - Game updates
   - Move notifications
   - Chat messages
   - Player status

3. **Database Schema**:
   - Đã cập nhật Prisma schema với các model mới
   - User rating system
   - Game messages
   - Time controls

## 🚧 TODO

- [ ] Tích hợp với real API
- [ ] WebSocket real-time updates
- [ ] Rating system calculation
- [ ] Tournament mode
- [ ] Friend system
- [ ] Game analysis
- [ ] Mobile app

## 🎨 Design System

### Colors
- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Error: Red (#EF4444)
- Background: Black với opacity

### Components
- Sử dụng Radix UI làm base
- Custom styling với Tailwind CSS
- Glassmorphism effects
- Smooth animations

## 📱 Responsive

- Mobile-first design
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Touch-friendly controls
- Optimized for chess gameplay

---

**Lưu ý**: Frontend hiện tại đã hoàn thiện và sẵn sàng để tích hợp với backend. Tất cả các component đều có mock data để test UI/UX.


