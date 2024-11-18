import React, { useEffect } from 'react';
import { Modal as BootstrapModal } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import 'chartjs-adapter-date-fns';

const Modal = ({ show, handleClose, chartData = {}, chartType }) => {
  // Ensure chartData is always an object and chartData.labels and chartData.values are valid arrays
  const { labels = [], values = [] } = chartData;

  const data = {
    labels: labels, // Fallback to empty array
    datasets: [
      {
        label: chartType === 'timeline' ? 'Timeline Data' : 'Line Chart Data',
        data: values, // Fallback to empty array
        fill: false,
        backgroundColor: 'rgba(75, 192, 192, 1)',
        borderColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  const options = {
    scales: {
      x: chartType === 'timeline'
        ? {
            type: 'time',
            time: {
              unit: 'day',
            },
            title: {
              display: true,
              text: 'Date',
            },
          }
        : {
            beginAtZero: true,
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

  useEffect(() => {
    if (show && chartType === 'timeline') {
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

      dataTable.addColumn({ type: 'string', id: 'Room' });
      dataTable.addColumn({ type: 'string', id: 'Name' });
      dataTable.addColumn({ type: 'date', id: 'Start' });
      dataTable.addColumn({ type: 'date', id: 'End' });

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
      size="lg"
      dialogClassName="modal-auto-width"
    >
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>{chartType === 'timeline' ? 'Timeline Chart' : 'Line Chart'}</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        {chartType === 'timeline' ? (
          <div id="google-timeline" style={{ width: '100%', height: '400px' }}></div>
        ) : (
          <div style={{ width: '100%', height: '400px' }}>
            {labels.length > 0 && values.length > 0 ? (
              <Line data={data} options={options} />
            ) : (
              <p>No data available</p>
            )}
          </div>
        )}
      </BootstrapModal.Body>
    </BootstrapModal>
  );
};

export default Modal;
