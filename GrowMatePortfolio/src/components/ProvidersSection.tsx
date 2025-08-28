import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Monitor, 
  Users, 
  AlertTriangle, 
  Settings, 
  Shield, 
  BarChart3,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const ProvidersSection: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const providersImages = [
    {
      src: `${process.env.PUBLIC_URL}/images/Providers_dash.png`,
      title: 'Administrative Dashboard',
      description: 'Real-time system statistics and monitoring overview'
    },
    {
      src: `${process.env.PUBLIC_URL}/images/Providers_hazardMangment.png`,
      title: 'Hazard Management System',
      description: 'Interactive map interface for managing environmental hazards'
    },
    {
      src: `${process.env.PUBLIC_URL}/images/Providers_userMang.png`,
      title: 'User Management',
      description: 'Comprehensive user account administration and monitoring'
    }
  ];

  const openModal = () => {
    setIsModalOpen(true);
    setCurrentImageIndex(0);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % providersImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + providersImages.length) % providersImages.length);
  };

  const features = [
    {
      title: "Administrative Dashboard",
      description: "Real-time system statistics, activity monitoring, and system health overview",
      icon: BarChart3,
      color: "#3b82f6"
    },
    {
      title: "User Management",
      description: "Complete user account administration, profile management, and status monitoring",
      icon: Users,
      color: "#22c55e"
    },
    {
      title: "Hazard Management",
      description: "Interactive map interface for managing environmental hazards with severity filtering",
      icon: AlertTriangle,
      color: "#ef4444"
    },
    {
      title: "Sensor Management",
      description: "Monitor IoT sensors, manage configurations, and track sensor assignments",
      icon: Settings,
      color: "#8b5cf6"
    },
    {
      title: "Secure Authentication",
      description: "JWT-based admin authentication with role-based access control",
      icon: Shield,
      color: "#f97316"
    }
  ];

  return (
    <section id="providers" style={{ padding: '80px 0', backgroundColor: '#f8fafc' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <Monitor size={40} color="#3b82f6" style={{ marginRight: '12px' }} />
            <h2 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              color: '#111827', 
              margin: 0
            }}>
              Provider <span style={{ color: '#3b82f6' }}>Web App</span>
            </h2>
          </div>
          <p style={{ 
            fontSize: '1.2rem', 
            color: '#6b7280', 
            maxWidth: '800px', 
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            For every good app, there is good customer support - and that's why we developed a fully functional system for GrowMate AI service providers and administrators to deliver exceptional support, monitor the entire ecosystem, and ensure every gardener gets the help they deserve. 🌱✨
          </p>
        </div>

        {/* Demo Button */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <button
            onClick={openModal}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '16px 32px',
              fontSize: '1.1rem',
              fontWeight: '600',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#3b82f6';
              e.currentTarget.style.transform = 'translateY(0px)';
            }}
          >
            <Monitor size={20} />
            View Provider Dashboard Screenshots
          </button>
        </div>

        {/* Core Functionalities */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            color: '#111827', 
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            🔧 Core Functionalities
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px'
          }}>
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '16px',
                  padding: '32px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease'
                }}
                whileHover={{
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  transform: 'translateY(-5px)'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      backgroundColor: feature.color,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 4px 12px ${feature.color}33`
                    }}>
                      <feature.icon size={28} color="white" />
                    </div>
                    <h4 style={{
                      fontSize: '1.25rem',
                      fontWeight: '700',
                      color: '#111827',
                      margin: 0
                    }}>
                      {feature.title}
                    </h4>
                  </div>
                  <p style={{
                    fontSize: '0.95rem',
                    color: '#6b7280',
                    lineHeight: '1.6',
                    margin: 0
                  }}>
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Support Section */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '60px',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '16px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ 
            fontSize: '1.8rem', 
            fontWeight: '600', 
            color: '#111827', 
            marginBottom: '16px' 
          }}>
            🎯 Custom Support & Administration
          </h3>
          <p style={{ 
            fontSize: '1.1rem', 
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Dedicated administrative tools for service providers to deliver exceptional customer support, 
            monitor system performance, and ensure optimal user experience across the GrowMateAI platform.
          </p>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px'
              }}
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '40px',
                  maxWidth: '900px',
                  width: '100%',
                  maxHeight: '90vh',
                  overflow: 'auto',
                  position: 'relative'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={closeModal}
                  style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#f3f4f6',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                >
                  <X size={24} color="#374151" />
                </button>

                {/* Modal Header */}
                <h2 style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: '8px',
                  textAlign: 'center'
                }}>
                  Provider Web Dashboard
                </h2>
                <p style={{
                  fontSize: '1.1rem',
                  color: '#6b7280',
                  textAlign: 'center',
                  marginBottom: '32px'
                }}>
                  Administrative interface for managing the GrowMateAI ecosystem
                </p>

                {/* Image Gallery */}
                <div style={{ position: 'relative', marginBottom: '24px' }}>
                  <img
                    src={providersImages[currentImageIndex].src}
                    alt={providersImages[currentImageIndex].title}
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '500px',
                      objectFit: 'contain',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      backgroundColor: '#f9fafb'
                    }}
                  />
                  
                  {/* Navigation Buttons */}
                  {providersImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '48px',
                          height: '48px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                          transition: 'background-color 0.3s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'}
                      >
                        <ChevronLeft size={24} color="#374151" />
                      </button>

                      <button
                        onClick={nextImage}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '48px',
                          height: '48px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                          transition: 'background-color 0.3s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'}
                      >
                        <ChevronRight size={24} color="#374151" />
                      </button>
                    </>
                  )}
                </div>

                {/* Image Indicators */}
                {providersImages.length > 1 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '24px'
                  }}>
                    {providersImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          border: 'none',
                          backgroundColor: index === currentImageIndex ? '#3b82f6' : '#d1d5db',
                          cursor: 'pointer',
                          transition: 'background-color 0.3s ease'
                        }}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
};

export default ProvidersSection;
