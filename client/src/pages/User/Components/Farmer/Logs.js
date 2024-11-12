const Logs = ({ logs }) => {
    return (
      <div>
        <div className='borderring'>
          <div className='mb-3'> 
            <h6 className='text-secondary'>Farm logs</h6>
          </div>
  
          <table className="table table-striped table-hover">
            <tbody>
              {logs.map((log, i) => (
                <tr key={i}>
                  <td>{log.message}</td>
                  <td>{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  
  export default Logs;
  