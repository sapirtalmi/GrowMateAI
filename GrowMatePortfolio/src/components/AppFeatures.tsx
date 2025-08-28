import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smartphone, 
  Plus, 
  Activity, 
  Bot, 
  Mail, 
  AlertTriangle, 
  Lightbulb, 
  Users,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const AppFeatures: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentFeature, setCurrentFeature] = useState('');

  const gardenBuilderImages = [
    {
      src: `${process.env.PUBLIC_URL}/images/build_garden_1.PNG`,
      title: 'Garden Planning Interface',
      description: 'Start by selecting your garden space and environmental conditions'
    },
    {
      src: `${process.env.PUBLIC_URL}/images/build_garden_2.PNG`,
      title: 'Plant Selection & Compatibility',
      description: 'AI suggests compatible plants based on your space and preferences'
    },
    {
      src: `${process.env.PUBLIC_URL}/images/build_garden_3.PNG`,
      title: 'Smart Layout Design',
      description: 'Optimal plant placement for growth, sunlight, and water requirements'
    },
    {
      src: `${process.env.PUBLIC_URL}/images/build_garden_4.PNG`,
      title: 'Final Garden Blueprint',
      description: 'Your personalized garden plan with care instructions and timeline'
    }
  ];

  const hazardReportingImages = [
    {
      src: `${process.env.PUBLIC_URL}/images/hazards_page.PNG`,
      title: 'Hazards Dashboard',
      description: 'Monitor and track potential threats to your plants'
    },
    {
      src: `${process.env.PUBLIC_URL}/images/manage_hazards_notifications.PNG`,
      title: 'Notification Management',
      description: 'Configure and manage hazard alert preferences'
    },
    {
      src: `${process.env.PUBLIC_URL}/images/report_hazards.PNG`,
      title: 'Report Hazards',
      description: 'Easy reporting system for new environmental threats'
    }
  ];

  const wateringNotificationImages = [
    {
      src: `${process.env.PUBLIC_URL}/images/watering_notifi.PNG`,
      title: 'Watering Notifications',
      description: 'Smart watering reminders based on sensor data'
    }
  ];

  const aiPlantAssistantImages = [
    {
      src: `${process.env.PUBLIC_URL}/images/AI_plant1.PNG`,
      title: 'AI Plant Analysis',
      description: 'Upload plant photos for instant AI-powered health analysis'
    },
    {
      src: `${process.env.PUBLIC_URL}/images/AI_plant2.PNG`,
      title: 'Disease Detection',
      description: 'Advanced AI algorithms identify plant diseases and issues'
    },
    {
      src: `${process.env.PUBLIC_URL}/images/AI_plant3.PNG`,
      title: 'Treatment Recommendations',
      description: 'Get personalized care instructions and treatment plans'
    }
  ];

  const sensorPairingImages = [
    {
      src: `${process.env.PUBLIC_URL}/images/sensor_pairing1.PNG`,
      title: 'Sensor Discovery',
      description: 'Discover and connect to nearby GrowMate sensors'
    },
    {
      src: `${process.env.PUBLIC_URL}/images/sensor_pairing2.PNG`,
      title: 'Pairing Process',
      description: 'Step-by-step sensor pairing and configuration'
    },
    {
      src: `${process.env.PUBLIC_URL}/images/my_sensor_page.PNG`,
      title: 'Sensor Management',
      description: 'View and manage all your connected sensors'
    }
  ];

  const addNewPlantsImages = [
    {
      src: `${process.env.PUBLIC_URL}/images/my_plants_page.PNG`,
      title: 'My Plants Dashboard',
      description: 'View and manage your plant collection'
    },
    {
      src: `${process.env.PUBLIC_URL}/images/add_new_plant.PNG`,
      title: 'Add New Plant',
      description: 'Easy plant registration with detailed profiles'
    }
  ];

  const livePlantDataImages = [
    {
      src: `${process.env.PUBLIC_URL}/images/plantStat.PNG`,
      title: 'Live Plant Statistics',
      description: 'Real-time monitoring of plant health and environmental data'
    }
  ];

  const communityImages = [
    {
      src: `${process.env.PUBLIC_URL}/images/community.PNG`,
      title: 'Community Hub',
      description: 'Connect with fellow gardening enthusiasts and share experiences'
    }
  ];

  const handleFeatureClick = (featureTitle: string) => {
    if (featureTitle === 'AI Garden Builder' || 
        featureTitle === 'Hazard Reporting' || 
        featureTitle === 'Watering Notifications' || 
        featureTitle === 'AI Plant Assistant' ||
        featureTitle === 'Pairing New Sensors' ||
        featureTitle === 'Adding New Plants' ||
        featureTitle === 'Live Plant Data' ||
        featureTitle === 'Community Hub') {
      setCurrentFeature(featureTitle);
      setIsModalOpen(true);
      setCurrentImageIndex(0);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const getCurrentImages = () => {
    if (currentFeature === 'AI Garden Builder') return gardenBuilderImages;
    if (currentFeature === 'Hazard Reporting') return hazardReportingImages;
    if (currentFeature === 'Watering Notifications') return wateringNotificationImages;
    if (currentFeature === 'AI Plant Assistant') return aiPlantAssistantImages;
    if (currentFeature === 'Pairing New Sensors') return sensorPairingImages;
    if (currentFeature === 'Adding New Plants') return addNewPlantsImages;
    if (currentFeature === 'Live Plant Data') return livePlantDataImages;
    if (currentFeature === 'Community Hub') return communityImages;
    return gardenBuilderImages;
  };

  const nextImage = () => {
    const images = getCurrentImages();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    const images = getCurrentImages();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  const features = [
    {
      title: "Pairing New Sensors",
      description: "Easily connect and configure your GrowMate sensors to monitor your plants in real-time",
      icon: Smartphone,
      color: "#3b82f6",
      category: "Hardware"
    },
    {
      title: "Adding New Plants",
      description: "Build your digital garden by adding new plants with detailed profiles and care instructions",
      icon: Plus,
      color: "#22c55e",
      category: "Management"
    },
    {
      title: "Live Plant Data",
      description: "Monitor real-time environmental data including moisture, temperature, humidity, and light levels",
      icon: Activity,
      color: "#f97316",
      category: "Monitoring"
    },
    {
      title: "AI Plant Assistant",
      description: "Get expert advice and disease analysis from our AI-powered chatbot for plant health issues",
      icon: Bot,
      color: "#8b5cf6",
      category: "AI Support"
    },
    {
      title: "Watering Notifications",
      description: "Receive personalized email alerts when your plants need watering based on sensor data",
      icon: Mail,
      color: "#06b6d4",
      category: "Alerts"
    },
    {
      title: "Hazard Reporting",
      description: "Get instant email notifications about environmental hazards that could harm your plants",
      icon: AlertTriangle,
      color: "#ef4444",
      category: "Safety"
    },
    {
      title: "AI Garden Builder",
      description: "Let our AI suggest the perfect garden layout and plant combinations for your space",
      icon: Lightbulb,
      color: "#eab308",
      category: "Planning"
    },
    {
      title: "Community Hub",
      description: "Connect with gardening enthusiasts, share posts, ask questions, and promote your gardening business",
      icon: Users,
      color: "#14b8a6",
      category: "Social"
    }
  ];

  return (
    <section style={{ padding: '80px 0', backgroundColor: '#f9fafb' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            color: '#111827', 
            marginBottom: '20px' 
          }}>
            App <span style={{ color: '#22c55e' }}>Features</span>
          </h2>
          <p style={{ 
            fontSize: '1.2rem', 
            color: '#6b7280', 
            maxWidth: '600px', 
            margin: '0 auto' 
          }}>
            Discover everything you can do with GrowMateAI - from sensor management to AI-powered gardening assistance.
          </p>
          <p style={{ 
            fontSize: '1rem', 
            color: '#10b981', 
            fontWeight: '600', 
            marginTop: '12px',
            fontStyle: 'italic'
          }}>
            💡 Click on features to see screenshot examples
          </p>
        </div>

        {/* Features Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          marginTop: '40px'
        }}>
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleFeatureClick(feature.title)}
              style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                height: 'fit-content'
              }}
              whileHover={{
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                transform: 'translateY(-8px)'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Icon and Category */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: feature.color,
                    backgroundColor: `${feature.color}15`,
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: `1px solid ${feature.color}30`
                  }}>
                    {feature.category}
                  </span>
                </div>

                {/* Content */}
                <div>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '12px',
                    lineHeight: '1.3'
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{
                    fontSize: '0.95rem',
                    color: '#6b7280',
                    lineHeight: '1.6'
                  }}>
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* AI Garden Builder Modal */}
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
                  maxWidth: '800px',
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
                  {currentFeature}
                </h2>
                <p style={{
                  fontSize: '1.1rem',
                  color: '#6b7280',
                  textAlign: 'center',
                  marginBottom: '32px'
                }}>
                  {currentFeature === 'AI Garden Builder' 
                    ? 'Let our AI guide you through creating the perfect garden layout'
                    : currentFeature === 'Hazard Reporting'
                    ? 'Monitor and manage potential threats to keep your plants safe'
                    : currentFeature === 'Watering Notifications'
                    ? 'Receive personalized watering reminders based on real-time sensor data'
                    : currentFeature === 'AI Plant Assistant'
                    ? 'Get expert AI-powered plant diagnosis and personalized care recommendations'
                    : currentFeature === 'Pairing New Sensors'
                    ? 'Easy setup and management of your GrowMate sensors'
                    : currentFeature === 'Adding New Plants'
                    ? 'Build your digital garden with detailed plant profiles and care tracking'
                    : currentFeature === 'Community Hub'
                    ? 'Connect with fellow gardening enthusiasts and share your growing journey'
                    : 'Monitor real-time environmental data and plant health statistics'
                  }
                </p>

                {/* Image Gallery */}
                <div style={{ position: 'relative', marginBottom: '24px' }}>
                  <img
                    src={getCurrentImages()[currentImageIndex].src}
                    alt={getCurrentImages()[currentImageIndex].title}
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
                </div>

                {/* Image Indicators */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '24px'
                }}>
                  {getCurrentImages().map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        border: 'none',
                        backgroundColor: index === currentImageIndex ? '#22c55e' : '#d1d5db',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease'
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
};

export default AppFeatures;
