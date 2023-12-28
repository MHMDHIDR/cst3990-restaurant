import { useState, useEffect } from 'react'
import useAxios from 'hooks/useAxios'

const About = () => {
  const [data, setData] = useState<string | any>()

  const { response, loading } = useAxios({ url: '/settings' })

  useEffect(() => {
    if (response !== null) {
      setData(response?.response[0])
    }
  }, [response])

  return (
    <section id='about' className='py-12 my-8 about'>
      <div className='container mx-auto'>
        <h2 className='mx-0 mt-4 mb-12 text-2xl text-center md:text-3xl'>About</h2>
        <p
          className={`max-w-6xl mx-4 sm:mx-auto leading-[3rem] ${
            data?.appDesc?.length > 75 ? 'text-justify' : 'text-center'
          }`}
        >
          {loading
            ? `Order the most delicious fresh food and drinks from our restaurant`
            : data?.appDesc}
        </p>
      </div>
    </section>
  )
}

export default About
