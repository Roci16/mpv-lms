import Head from 'next/head';
import { courses } from '../utils';

export default function Home() {

  return (
    <div className='p-10 bg-blue-100 min-h-screen'>

      <Head>
        <title>Scorm MVP</title>
      </Head>

      <h1 className='text-4xl font-bold my-6'>Scorm MVP</h1>
      <h2 className='text-xl font-semibold my-4'>Cursos:</h2>

      <ul className='px-6'>
        {
          courses && courses.map(course => (
            <li
              className='my-3'
              key={course.id}
            >
              <a
                href={`/course/${course.id}`}
              >
                <div className='flex items-center shadow max-w-sm rounded p-2 bg-slate-50 hover:bg-slate-500 hover:text-slate-50'>
                  <img src={course.thumbnail} className='w-10 h-10 mr-3 rounded' />
                  {course.name}
                </div>
              </a>
            </li>
          ))
        }
      </ul>

    </div>
  )
}
