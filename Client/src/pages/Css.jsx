import React from 'react'

const Css = () => {
  return (
    <>
      <div className='flex flex-row gap-3'>
        <li className='bg-purple-600 text-white text-2xl basis-auto'>1</li>
        <li className='bg-purple-600 text-white text-2xl basis-auto'>2</li>
        <li className='bg-purple-600 text-white text-2xl basis-auto'>3</li>
      </div>
      <div className='flex flex-row gap-3 flex-wrap'>
        <li className='bg-purple-600 text-white text-2xl flex-none'>1</li>
        <li className='bg-purple-600 text-white text-2xl flex-initial'>2</li>
        <li className='bg-purple-600 w-64 text-white text-2xl flex-auto'>3</li>
      </div>
    </>
  )
}

export default Css