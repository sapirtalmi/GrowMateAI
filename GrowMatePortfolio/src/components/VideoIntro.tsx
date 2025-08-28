import React from 'react';
import { motion } from 'framer-motion';
import { Play, Eye, Github } from 'lucide-react';

const VideoIntro: React.FC = () => {
  return (
    <section style={{ padding: '80px 0', backgroundColor: '#ffffff' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '60px' }}
        >
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            color: '#111827', 
            marginBottom: '20px' 
          }}>
            See <span style={{ color: '#22c55e' }}>GrowMateAI</span> in Action
          </h2>
          <p style={{ 
            fontSize: '1.2rem', 
            color: '#6b7280', 
            maxWidth: '600px', 
            margin: '0 auto',
            marginBottom: '10px'
          }}>
            Watch our comprehensive app demonstration to discover all the amazing features that make smart gardening effortless.
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: '#10b981',
            fontSize: '1rem',
            fontWeight: '600'
          }}>
            <Eye size={20} />
            <span>Complete App Walkthrough</span>
          </div>
        </motion.div>

        {/* Video Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          style={{
            position: 'relative',
            paddingBottom: '56.25%', // 16:9 aspect ratio
            height: 0,
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '3px solid #22c55e'
          }}
        >
          <iframe
            src="https://www.youtube.com/embed/KgPflrhd2_k"
            title="GrowMateAI App Introduction"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none'
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          style={{
            textAlign: 'center',
            marginTop: '40px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            alignItems: 'center'
          }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: '#f0fdf4',
            color: '#15803d',
            padding: '12px 24px',
            borderRadius: '50px',
            border: '2px solid #bbf7d0',
            fontSize: '1rem',
            fontWeight: '600'
          }}>
            <Play size={20} />
            <span>Ready to explore the features? Check them out below!</span>
          </div>

          <a 
            href="https://github.com/sapirtalmi/GrowMateAI"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: '#f8fafc',
              color: '#334155',
              padding: '12px 24px',
              borderRadius: '50px',
              border: '2px solid #e2e8f0',
              fontSize: '1rem',
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e2e8f0';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <Github size={20} />
            <span>See GitHub Repository</span>
          </a>
        </motion.div>

      </div>
    </section>
  );
};

export default VideoIntro;
