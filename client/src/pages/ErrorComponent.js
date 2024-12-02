import React, { useEffect } from 'react';

function ErrorComponent() {
    useEffect(() => {
        // Add loading class initially, then remove it after a delay
        document.body.classList.add('loading');
        const timer = setTimeout(() => {
          document.body.classList.remove('loading');
        }, 1000);
    
        // Cleanup on component unmount
        return () => clearTimeout(timer);
      }, []);
    
      return (
        <div className="error-page">
            <div className='mb-5'>

          <h1>Server Unexpected Error <b>:(</b>
          </h1>

            </div>
          <div className="gears">
            <div className="gear one">
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
            </div>
            <div className="gear two">
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
            </div>
            <div className="gear three">
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
            </div>
          </div>
        </div>
      );
}

export default ErrorComponent;
