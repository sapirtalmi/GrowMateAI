import React from 'react';
import { motion } from 'framer-motion';
import { 
  Cpu, 
  Wifi, 
  Droplets, 
  Thermometer, 
  Wind, 
  Zap, 
  Battery, 
  Plus,
  Timer,
  Settings
} from 'lucide-react';

const SensorSection: React.FC = () => {
  const sensorFeatures = [
    {
      icon: Cpu,
      title: "ESP32-C3 Powered",
      description: "Built on the powerful ESP32-C3 microcontroller with WiFi connectivity",
      color: "#3b82f6"
    },
    {
      icon: Droplets,
      title: "Soil Moisture",
      description: "Capacitive soil moisture sensor for accurate water level detection",
      color: "#06b6d4"
    },
    {
      icon: Thermometer,
      title: "Temperature",
      description: "Precise temperature monitoring for optimal plant growth conditions",
      color: "#f97316"
    },
    {
      icon: Wind,
      title: "Air Humidity",
      description: "Environmental humidity sensor for comprehensive climate monitoring",
      color: "#22c55e"
    },
    {
      icon: Settings,
      title: "Mini Server Mode",
      description: "Creates temporary WiFi hotspot for easy pairing and configuration",
      color: "#8b5cf6"
    },
    {
      icon: Timer,
      title: "Hourly Data Sync",
      description: "Automatically transmits collected data every hour via your WiFi network",
      color: "#ef4444"
    }
  ];

  const futureUpgrades = [
    "Light intensity sensors (PAR/Lux)",
    "pH level monitoring",
    "Vibration/movement sensors"
  ];

  return (
    <section id="sensor" style={{ padding: '100px 0', backgroundColor: '#f8fafc' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '80px' }}
        >
          <h2 style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            color: '#111827', 
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            GrowMate <span style={{ color: '#3b82f6' }}>Sensor</span>
          </h2>
          <p style={{ 
            fontSize: '1.3rem', 
            color: '#6b7280', 
            maxWidth: '700px', 
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Advanced IoT sensor technology designed specifically for intelligent plant monitoring and care automation.
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '80px',
          alignItems: 'center',
          marginBottom: '80px'
        }}>
          
          {/* Sensor Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ position: 'relative' }}
          >
            <div style={{
              position: 'relative',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
              background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)'
            }}>
              <img
                src={`${process.env.PUBLIC_URL}/images/GrowMateSensor.png`}
                alt="GrowMate Sensor"
                style={{
                  width: '100%',
                  height: '500px',
                  objectFit: 'contain',
                  backgroundColor: 'white',
                  padding: '20px'
                }}
              />
              
              {/* Floating Badge */}
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '0.875rem',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
              }}>
                ESP32-C3 Powered
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 style={{
              fontSize: '2.2rem',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '24px',
              lineHeight: '1.2'
            }}>
              Smart Environmental Monitoring
            </h3>
            
            <p style={{
              fontSize: '1.1rem',
              color: '#4b5563',
              lineHeight: '1.8',
              marginBottom: '32px'
            }}>
              The GrowMate Sensor is built on the powerful <strong>ESP32-C3 microcontroller</strong>, 
              integrating advanced environmental monitoring capabilities into a sleek, compact design. 
              Each sensor comes equipped with precision sensors for comprehensive plant care monitoring.
            </p>

            {/* Power Options */}
            <div style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '32px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '2px solid #22c55e',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
              }}>
                <Zap size={20} color="#22c55e" />
                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#111827' }}>
                  USB-C Powered
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '2px solid #f59e0b',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
              }}>
                <Battery size={20} color="#f59e0b" />
                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#111827' }}>
                  Battery Model in Development
                </span>
              </div>
            </div>

            {/* Key Features */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px'
            }}>
              <div style={{
                padding: '16px',
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
              }}>
                <Wifi size={24} color="#3b82f6" style={{ marginBottom: '8px' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                  Smart Pairing
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Creates mini server for easy WiFi setup
                </p>
              </div>
              <div style={{
                padding: '16px',
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
              }}>
                <Timer size={24} color="#ef4444" style={{ marginBottom: '8px' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                  Auto Sync
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Hourly data transmission via WiFi
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sensor Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ marginBottom: '80px' }}
        >
          <h3 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#111827',
            textAlign: 'center',
            marginBottom: '48px'
          }}>
            Sensor Capabilities
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '24px'
          }}>
            {sensorFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                style={{
                  backgroundColor: 'white',
                  padding: '32px',
                  borderRadius: '16px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.3s ease'
                }}
                whileHover={{
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                  transform: 'translateY(-4px)'
                }}
              >
                <div style={{
                  width: '56px',
                  height: '56px',
                  backgroundColor: `${feature.color}15`,
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  <feature.icon size={28} color={feature.color} />
                </div>
                <h4 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: '12px'
                }}>
                  {feature.title}
                </h4>
                <p style={{
                  fontSize: '1rem',
                  color: '#6b7280',
                  lineHeight: '1.6'
                }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Future Upgrades Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            backgroundColor: 'white',
            padding: '48px',
            borderRadius: '24px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)'
          }}
        >
          <h3 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#111827',
            textAlign: 'center',
            marginBottom: '24px'
          }}>
            Future Sensor Upgrades
          </h3>
          <p style={{
            fontSize: '1.1rem',
            color: '#6b7280',
            textAlign: 'center',
            marginBottom: '40px',
            maxWidth: '600px',
            margin: '0 auto 40px auto'
          }}>
            Our modular design allows for easy expansion with additional sensors to create 
            the most comprehensive plant monitoring system available.
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px'
          }}>
            {futureUpgrades.map((upgrade, index) => (
              <motion.div
                key={upgrade}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px 20px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <Plus size={20} color="#22c55e" />
                <span style={{
                  fontSize: '1rem',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  {upgrade}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default SensorSection;
