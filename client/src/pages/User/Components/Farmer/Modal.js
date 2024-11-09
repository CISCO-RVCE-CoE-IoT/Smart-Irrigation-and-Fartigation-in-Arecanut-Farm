import React, { useEffect } from 'react';
import { Modal as BootstrapModal } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import 'chartjs-adapter-date-fns';

const Modal = ({ show, handleClose, chartData, chartType }) => {
  // Common dataset structure for the line chart
  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: chartType === 'timeline' ? 'Timeline Data' : 'Line Chart Data',
        data: chartData.values,
        fill: false,
        backgroundColor: 'rgba(75, 192, 192, 1)',
        borderColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  // Customize options for each chart type (line chart or timeline)
  const options = {
    scales: {
      x: chartType === 'timeline'
        ? {
            type: 'time', // Time scale for timeline chart
            time: {
              unit: 'day', // Display by day for timeline (can adjust to 'month', 'hour', etc.)
            },
            title: {
              display: true,
              text: 'Date',
            },
          }
        : {
            beginAtZero: true, // Standard line chart behavior
          },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Value',
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  // Effect to load Google Charts for timeline chart
  useEffect(() => {
    if (show && chartType === 'timeline') {
      // Dynamically load Google Charts script if it's not already loaded
      if (!window.google) {
        const script = document.createElement('script');
        script.src = "https://www.gstatic.com/charts/loader.js";
        script.type = "text/javascript";
        script.onload = () => {
          window.google.charts.load("current", { packages: ["timeline"] });
          window.google.charts.setOnLoadCallback(drawTimelineChart);
        };
        document.head.appendChild(script);
      } else {
        window.google.charts.load("current", { packages: ["timeline"] });
        window.google.charts.setOnLoadCallback(drawTimelineChart);
      }
    }

    function drawTimelineChart() {
      const container = document.getElementById('google-timeline');
      const chart = new window.google.visualization.Timeline(container);
      const dataTable = new window.google.visualization.DataTable();
      
      // Add columns for the chart (similar to the provided example)
      dataTable.addColumn({ type: 'string', id: 'Room' });
      dataTable.addColumn({ type: 'string', id: 'Name' });
      dataTable.addColumn({ type: 'date', id: 'Start' });
      dataTable.addColumn({ type: 'date', id: 'End' });

      // Add data dynamically or use hardcoded example
      dataTable.addRows([
        ['Magnolia Room', 'Google Charts', new Date(0, 0, 0, 14, 0, 0), new Date(0, 0, 0, 15, 0, 0)],
        ['Magnolia Room', 'App Engine', new Date(0, 0, 0, 15, 0, 0), new Date(0, 0, 0, 16, 0, 0)],
      ]);

      const options = {
        timeline: { showRowLabels: false },
        avoidOverlappingGridLines: false,
      };

      chart.draw(dataTable, options);
    }

    return () => {
      // Clean up the Google Charts script
      const script = document.querySelector('script[src="https://www.gstatic.com/charts/loader.js"]');
      if (script) {
        script.remove();
      }
    };
  }, [show, chartType]);

  return (
    <BootstrapModal
      show={show}
      onHide={handleClose}
      centered
      size="lg"  // Adjust modal size here
      dialogClassName="modal-auto-width"  // Custom class for dynamic sizing
    >
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>{chartType === 'timeline' ? 'Timeline Chart' : 'Line Chart'}</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        {chartType === 'timeline' ? (
          <div id="google-timeline" style={{ maxHeightheight: 'auto', width: '100%' }}></div>
        ) : (
          <div style={{ height: 'auto', width: '100%' }}>
            <Line data={data} options={options} />
          </div>
        )}
      </BootstrapModal.Body>
    </BootstrapModal>
  );
};

export default Modal;
