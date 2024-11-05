import React from 'react'

const Logs = ({logs}) => {
    return (
        <div>
            <div className='borderring'>
                <div className='mb-3'> 
                    <h6 className='text-secondary'>Farm logs</h6>
                </div>


                <table class="table table-striped table-hover">
                    <tbody>
                        {
                            logs.map((log,i)=>(
                                <tr key={i}>
                                    <td>{log.title}</td>
                                    <td>{log.time}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Logs