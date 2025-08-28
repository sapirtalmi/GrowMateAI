import React from 'react';
import './App.css';
import TechStack from './components/TechStack';
import AppFeatures from './components/AppFeatures';
import ProvidersSection from './components/ProvidersSection';
import SensorSection from './components/SensorSection';
import VideoIntro from './components/VideoIntro';

function App() {
  return (
    <div className="App">
      {/* Header */}
      <header className="header">
        <nav className="nav">
          <div className="logo">
            <span className="logo-icon">🌱</span>
            <span className="logo-text">GrowMateAI</span>
          </div>
          <div className="nav-links">
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#features">Features</a>
            <a href="#app-features">App Features</a>
            <a href="#sensor">Sensor</a>
            <a href="#tech">Tech Stack</a>
            <a href="#providers">Providers</a>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="highlight">Cultivate</span> Your Smart Garden
            </h1>
            <p className="hero-subtitle">
              GrowMateAI combines AI intelligence with custom ESP32 sensors to monitor plant health, 
              detect issues early, and deliver personalized care recommendations for healthier plants.
            </p>
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Monitoring</div>
              </div>
              <div className="stat">
                <div className="stat-number">AI</div>
                <div className="stat-label">Powered</div>
              </div>
              <div className="stat">
                <div className="stat-number">ESP32</div>
                <div className="stat-label">Sensors</div>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <div className="app-mockup">
              <img 
                src={`${process.env.PUBLIC_URL}/images/wellcomepage.PNG`}
                alt="GrowMateAI Welcome Screen" 
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '20px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                  maxWidth: '300px'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section">
        <div className="container">
          <h2 className="section-title">About <span className="highlight">GrowMateAI</span></h2>
          <div className="about-content">
            <div className="about-text">
              <h3>Smart Gardening Made Simple</h3>
              <p>
                Traditional gardening often involves guesswork - when to water, how much light is enough, 
                or why plants aren't thriving. GrowMateAI eliminates this uncertainty by providing 
                real-time, data-driven insights.
              </p>
              <p>
                Our custom ESP32-based sensors continuously monitor critical plant parameters like soil 
                moisture, temperature, humidity, and light levels. This data feeds into our AI system, 
                powered by ChatGPT, which analyzes patterns and delivers personalized care recommendations.
              </p>
            </div>
            <div className="benefits-grid">
              <div className="benefit-card">
                <div className="benefit-icon">🎯</div>
                <h4>Precision Care</h4>
                <p>Get exact recommendations based on your specific plants and conditions.</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">❤️</div>
                <h4>Plant Health</h4>
                <p>Early detection of issues keeps your plants healthy and thriving.</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">📈</div>
                <h4>Growth Optimization</h4>
                <p>Optimize growing conditions for maximum plant growth and yield.</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">👥</div>
                <h4>For Everyone</h4>
                <p>Perfect for both gardening hobbyists and professional growers.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section section-gray">
        <div className="container">
          <h2 className="section-title">Powerful <span className="highlight">Features</span></h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Real-time Monitoring</h3>
              <p>Continuous 24/7 monitoring of soil moisture, temperature, humidity, and light levels.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🧠</div>
              <h3>AI Plant Diagnosis</h3>
              <p>ChatGPT-powered analysis provides intelligent insights and personalized care recommendations.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>ESP32 Integration</h3>
              <p>Custom-built sensors deliver precise, real-time environmental data directly to your app.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Mobile-First Design</h3>
              <p>Built with React Native for seamless experience across iOS and Android devices.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Video Introduction Section */}
      <VideoIntro />

      {/* App Features Section */}
      <AppFeatures />

      {/* Sensor Section */}
      <SensorSection />

      {/* Tech Stack Section */}
      <TechStack />

      {/* Providers Section */}
      <ProvidersSection />

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="logo">
                <span className="logo-icon">🌱</span>
                <span className="logo-text">GrowMateAI</span>
              </div>
              <p>Cultivate your smart garden with AI-powered insights and real-time monitoring.</p>
            </div>
            <div className="footer-links">
              <div className="footer-section">
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="#tech">Tech Stack</a>
                <a href="#about">About</a>
              </div>
              <div className="footer-section">
                <h4>Resources</h4>
                <a href="#sensor">Sensor</a>
                <a href="#providers">Providers</a>
                <a href="https://github.com/growmateai">GitHub</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 GrowMateAI. Built with ❤️ for smart gardening.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
