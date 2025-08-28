# GrowMate Providers Dashboard

A React-based web dashboard for GrowMate AI providers to control app usage, manage users, monitor hazards, and manage sensor devices.

## Features

### 🔐 Authentication
- JWT-based admin login
- Secure token management
- Auto-logout on token expiration

### 📊 Dashboard
- Real-time statistics overview
- Total users, hazards, sensors, and plants
- Recent activity monitoring
- Quick action buttons

### 👥 User Management
- View all registered users
- Search and filter users
- User status management (activate/deactivate)
- Detailed user information
- User account deletion

### ⚠️ Hazard Management
- View all reported hazards
- Create new hazards
- Filter by severity (low, medium, high, critical)
- Hazard location and radius management
- Activate/deactivate hazards
- Delete hazards

### 📡 Sensor Management
- View all sensor devices
- Generate new sensor IDs
- Bulk sensor ID generation
- Copy sensor IDs to clipboard
- Monitor sensor status and battery levels
- Sensor activation/deactivation

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- Access to GrowMateAI backend APIs
- Admin credentials for login

### Installation

1. **Install dependencies:**
   ```bash
   cd FrontendProviders
   npm install
   ```

2. **Configure API endpoint:**
   - Update `src/services/api.js` if needed
   - Default backend URL: `http://localhost:7071`

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Access the dashboard:**
   - Open http://localhost:3000
   - Login with admin credentials

### Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `build/` directory.

## API Integration

The dashboard integrates with the following GrowMateAI backend endpoints:

### Authentication
- `POST /login` - Admin login
- `GET /verify-token` - Token verification

### Users
- `GET /admin/users` - Get all users
- `PUT /admin/users/:id/status` - Update user status
- `DELETE /admin/users/:id` - Delete user

### Hazards
- `GET /getHazards` - Get all hazards
- `POST /createHazard` - Create new hazard
- `PUT /admin/hazards/:id/status` - Update hazard status
- `DELETE /admin/hazards/:id` - Delete hazard

### Sensors
- `GET /admin/sensors` - Get all sensors
- `POST /admin/sensors/generate` - Generate sensor IDs
- `PUT /admin/sensors/:id/status` - Update sensor status
- `DELETE /admin/sensors/:id` - Delete sensor

### Statistics
- `GET /admin/plants` - Get plants for statistics

## Project Structure

```
src/
├── components/
│   ├── Navbar.js          # Navigation bar
│   └── Modal.js           # Reusable modal component
├── pages/
│   ├── LoginPage.js       # Admin login page
│   ├── Dashboard.js       # Main dashboard
│   ├── UsersPage.js       # User management
│   ├── HazardsPage.js     # Hazard management
│   └── SensorsPage.js     # Sensor management
├── services/
│   └── api.js             # API service with axios
├── App.js                 # Main app component
├── App.css                # Global styles
└── index.js               # Entry point
```

## Features in Detail

### User Management
- **Search**: Find users by email or name
- **Filter**: Filter by user status (active/inactive/banned)
- **Actions**: View details, activate/deactivate, delete
- **User Details**: Full user profile in modal

### Hazard Management
- **Interactive Map**: Location-based hazard visualization
- **Severity Levels**: Color-coded severity indicators
- **Radius Management**: Configurable hazard radius
- **Status Control**: Active/inactive hazard management

### Sensor Management
- **Bulk Generation**: Generate multiple sensor IDs at once
- **Copy to Clipboard**: Easy sensor ID sharing
- **Status Monitoring**: Real-time sensor status tracking
- **Device Information**: Battery level, firmware version

## Environment Variables

Create a `.env` file in the project root:

```env
REACT_APP_API_BASE_URL=http://localhost:7071
REACT_APP_ENV=development
```

## Responsive Design

The dashboard is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

## Security Features

- JWT token-based authentication
- Auto token refresh
- Secure API calls with Authorization headers
- Protected routes
- Session timeout handling

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

When making changes:

1. Follow React best practices
2. Maintain the existing CSS structure
3. Update API calls when backend changes
4. Test responsiveness on mobile devices
5. Ensure proper error handling

## Troubleshooting

### Common Issues

1. **Login fails**: Check backend API is running on port 7071
2. **CORS errors**: Ensure backend allows frontend origin
3. **Token expires**: Clear localStorage and re-login
4. **Data not loading**: Check network tab for API errors

### Development Tips

- Use browser dev tools for debugging
- Check console for JavaScript errors
- Verify API responses in Network tab
- Test with different screen sizes

## License

This project is part of the GrowMateAI system and is proprietary software.
