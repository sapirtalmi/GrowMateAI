import React from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Brain, 
  Cpu, 
  BarChart3, 
  Bell,
  Droplets,
  Thermometer,
  Sun,
  Smartphone
} from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: Activity,
      title: "Real-time Monitoring",
      description: "Continuous 24/7 monitoring of soil moisture, temperature, humidity, and light levels with instant alerts.",
      color: "primary"
    },
    {
      icon: Brain,
      title: "AI Plant Diagnosis",
      description: "ChatGPT-powered analysis provides intelligent insights and personalized care recommendations.",
      color: "earth"
    },
    {
      icon: Cpu,
      title: "ESP32 Sensor Integration",
      description: "Custom-built sensors deliver precise, real-time environmental data directly to your app.",
      color: "primary"
    },
    {
      icon: BarChart3,
      title: "Visual Data History",
      description: "Track plant growth and environmental changes over time with beautiful, intuitive charts.",
      color: "earth"
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Get timely alerts via push notifications and email when your plants need attention.",
      color: "primary"
    },
    {
      icon: Smartphone,
      title: "Mobile-First Design",
      description: "Built with React Native for seamless experience across iOS and Android devices.",
      color: "earth"
    }
  ];

  const sensorFeatures = [
    { icon: Droplets, name: "Soil Moisture", value: "85%" },
    { icon: Thermometer, name: "Temperature", value: "24°C" },
    { icon: Sun, name: "Light Level", value: "Good" },
    { icon: Activity, name: "Humidity", value: "65%" }
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Powerful <span className="text-primary-600">Features</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how GrowMateAI combines cutting-edge technology with intuitive design 
            to transform your gardening experience.
          </p>
        </motion.div>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 group"
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200 ${
                feature.color === 'primary' 
                  ? 'bg-primary-100 group-hover:bg-primary-200' 
                  : 'bg-earth-100 group-hover:bg-earth-200'
              }`}>
                <feature.icon className={`h-6 w-6 ${
                  feature.color === 'primary' ? 'text-primary-600' : 'text-earth-600'
                }`} />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Sensor Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl p-8 shadow-lg"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Description */}
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-gray-900">
                ESP32 Sensor Network
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                Our custom-designed ESP32 sensors form the backbone of the GrowMateAI system. 
                These compact, wireless devices measure critical environmental parameters and 
                transmit data in real-time to our cloud infrastructure.
              </p>

              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <span className="text-gray-700">Wireless connectivity with long battery life</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <span className="text-gray-700">Weather-resistant design for outdoor use</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <span className="text-gray-700">Easy setup and calibration</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <span className="text-gray-700">Multiple sensors per garden support</span>
                </li>
              </ul>
            </div>

            {/* Right - Sensor Data Visualization */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Live Sensor Data</h4>
              
              <div className="grid grid-cols-2 gap-4">
                {sensorFeatures.map((sensor, index) => (
                  <motion.div
                    key={sensor.name}
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white p-4 rounded-lg text-center"
                  >
                    <sensor.icon className="h-6 w-6 text-primary-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{sensor.value}</div>
                    <div className="text-sm text-gray-600">{sensor.name}</div>
                  </motion.div>
                ))}
              </div>

              {/* Status Indicator */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-800 font-medium">All sensors online</span>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  Last updated: 2 minutes ago
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
