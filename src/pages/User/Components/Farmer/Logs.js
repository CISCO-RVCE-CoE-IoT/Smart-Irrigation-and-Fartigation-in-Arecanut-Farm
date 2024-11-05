import React from 'react'

const Logs = ({logs}) => {
    return (
        <div>
            <div className='borderring'>
                <div className='mb-3'> 
                <button type='button' className='btn btn-outline-secondary btn-sm me-2'>Farm Logs</button>
                <button type='button' className='btn btn-outline-secondary btn-sm'>Section Logs</button>
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