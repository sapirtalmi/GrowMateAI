import React from 'react';
import { motion } from 'framer-motion';
import { Database, Cloud, Smartphone, Cpu, Brain, Lock, Mail } from 'lucide-react';

const TechStack: React.FC = () => {
  const technologies = [
    {
      name: "React Native",
      description: "Cross-platform mobile development for iOS and Android",
      icon: Smartphone,
      category: "Mobile",
      color: "#3b82f6"
    },
    {
      name: "Azure Functions",
      description: "Serverless backend infrastructure for scalable processing",
      icon: Cloud,
      category: "Backend",
      color: "#2563eb"
    },
    {
      name: "MongoDB Atlas",
      description: "Cloud-based NoSQL database for flexible data storage",
      icon: Database,
      category: "Database",
      color: "#16a34a"
    },
    {
      name: "ESP32 Sensors",
      description: "Custom IoT devices for real-time environmental monitoring",
      icon: Cpu,
      category: "Hardware",
      color: "#9333ea"
    },
    {
      name: "ChatGPT API",
      description: "AI-powered plant analysis and personalized recommendations",
      icon: Brain,
      category: "AI/ML",
      color: "#f97316"
    },
    {
      name: "JWT Authentication",
      description: "Secure user authentication and session management",
      icon: Lock,
      category: "Security",
      color: "#ef4444"
    },
    {
      name: "SendGrid API",
      description: "Professional email delivery service for notifications",
      icon: Mail,
      category: "Communication",
      color: "#06b6d4"
    }
  ];

  console.log('Technologies array:', technologies);

  return (
    <section id="tech" key={Date.now()} style={{ padding: '80px 0', backgroundColor: 'white' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            color: '#111827', 
            marginBottom: '20px' 
          }}>
            Technology <span style={{ color: '#22c55e' }}>Stack</span>
          </h2>
          <p style={{ 
            fontSize: '1.2rem', 
            color: '#6b7280', 
            maxWidth: '600px', 
            margin: '0 auto' 
          }}>
            Built with modern, reliable technologies to deliver a robust and scalable smart gardening solution.
          </p>
        </div>

        {/* Technology Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)', // Change to 4 columns for better layout
          gap: '30px',
          marginTop: '40px'
        }}>
          {technologies.map((tech, index) => {
            console.log('Rendering technology:', tech.name);
            return (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                whileHover={{
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  transform: 'translateY(-5px)'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Icon and Category */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: tech.color,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <tech.icon size={24} color="white" />
                    </div>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      color: '#6b7280',
                      backgroundColor: '#f3f4f6',
                      padding: '4px 8px',
                      borderRadius: '12px'
                    }}>
                      {tech.category}
                    </span>
                  </div>

                  {/* Content */}
                  <div>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: '8px'
                    }}>
                      {tech.name}
                    </h3>
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      lineHeight: '1.5'
                    }}>
                      {tech.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Summary */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '60px',
          padding: '30px',
          backgroundColor: '#f9fafb',
          borderRadius: '12px'
        }}>
          <h3 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            color: '#111827', 
            marginBottom: '16px' 
          }}>
            Integrated Technology Solution
          </h3>
          <p style={{ 
            fontSize: '1rem', 
            color: '#6b7280' 
          }}>
            Our streamlined tech stack combines {technologies.length} essential technologies to deliver 
            a robust, scalable smart gardening platform with real-time monitoring and AI-powered insights.
          </p>
        </div>

      </div>
    </section>
  );
};

export default TechStack;
