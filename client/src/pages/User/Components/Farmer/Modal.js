import React, { useEffect } from 'react';
import { Modal as BootstrapModal } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import 'chartjs-adapter-date-fns';

const Modal = ({ show, handleClose, chartData = {}, chartType }) => {
  const { labels = [], datasets = [] } = chartData;

  const data = {
    labels,
    datasets: datasets.map((dataset, index) => ({
      ...dataset,
      borderColor: `rgba(${index * 50}, ${150 - index * 30}, ${200 - index * 20}, 1)`,
      backgroundColor: `rgba(${index * 50}, ${150 - index * 30}, ${200 - index * 20}, 0.2)`,
    })),
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

      dataTable.addColumn({ type: 'string', id: 'Section' });
      dataTable.addColumn({ type: 'string', id: 'Status' });
      dataTable.addColumn({ type: 'date', id: 'Start' });
      dataTable.addColumn({ type: 'date', id: 'End' });

      if (!Array.isArray(labels) || !Array.isArray(datasets[0].data)) {
        console.error("Labels or values are not arrays.");
        return;
      }

      if (labels.length === 0 || datasets[0].data.length === 0) {
        console.error("Labels or values arrays are empty.");
        return;
      }

      const rows = labels.map((label, index) => {
        if (!label || !datasets[0].data[index]) {
          console.error(`Missing value in row #${index}.`);
          return null;
        }

        const startTime = new Date(label);
        const endTime = index + 1 < labels.length ? new Date(labels[index + 1]) : new Date();
        const status = datasets[0].data[index];

        if (isNaN(startTime.getTime()) || (endTime && isNaN(endTime.getTime()))) {
          console.error(`Invalid date at row #${index}: start(${startTime}) or end(${endTime}) is not a valid date.`);
          return null;
        }

        if (endTime && startTime >= endTime) {
          console.warn(`Correcting invalid data at row #${index}: start(${startTime}) > end(${endTime}).`);
          endTime.setTime(startTime.getTime() + 60000); // Add 1 minute to end time
        }

        return ['Valve', status.trim(), startTime, endTime];
      }).filter(row => row !== null);

      if (rows.length === 0) {
        console.error("No valid data rows for the timeline chart.");
        return;
      }

      dataTable.addRows(rows);

      const options = {
        timeline: { showRowLabels: false },
        colors: ['#FF0000'],
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
  }, [show, chartType, labels, datasets]);

  return (
    <BootstrapModal
      show={show}
      onHide={handleClose}
      centered
      size="lg"
      dialogClassName="modal-auto-width"
    >
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>{chartType === 'timeline' ? 'Valve Timeline Chart' : 'Line Chart'}</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        {chartType === 'timeline' ? (
          <div id="google-timeline" style={{ width: '100%', height: '400px' }}></div>
        ) : (
          <div style={{ width: '100%', height: '400px' }}>
            {labels.length > 0 && datasets.length > 0 ? (
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
