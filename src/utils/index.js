// TODO no hardcodear los cursos. 
// Puede ser que obtengamos esta info pegandole a ismanifest.xml y meta.xml
export const courses = [
    {
        id: 'curso1',
        name: 'Modelo de Servicio Easy - Modulo 06',
        url: '/courses_files/curso1/index_lms.html',
        type: 'scorm12',
        thumbnail: '/courses_files/curso1/story_content/thumbnail.jpg',
        description: '',
    },
    {
        id: 'runtime',
        name: 'Curso de Runtime',
        url: '/courses_files/runtime/shared/launchpage.html',
        type: 'scorm12',
        thumbnail: '/courses_files/runtime/Etiquette/distracting.jpg',
        description: '',
    },
    {
        id: 'ReacCourse',
        name: 'React Intro',
        url: '/courses_files/ReacCourse/index.html',
        type: 'scorm12',
        thumbnail: '/courses_files/ReacCourse/icon_bulb.png',
        type: 'scorm12',
    
    },
    {
        id: 'ReactCourse2',
        name: 'React Intro 2',
        url: '/courses_files/ReactCourse2/react.html',
        type: 'scorm12',
        thumbnail: '/courses_files/ReactCourse2/adivinaHome.png',
        type: 'scorm12',
    
    },
    {
        id: 'courseWestern',
        name: 'Course Western',
        url: '/courses_files/courseWestern/topic.html',
        type: 'scorm12',
        thumbnail: '/courses_files/courseWestern/babyyoda.png',
        type: 'scorm12',
    
    },
    {
        id: 'platae',
        name: 'Plantae',
        url: '/courses_files/platae/index.html',
        type: 'scorm12',
        thumbnail: '/courses_files/runtime/Etiquette/course.jpg',
        type: 'scorm12',
    
    },
    {
        id: 'canes',
        name: 'Canes',
        url: '/courses_files/canes/index.html',
        type: 'scorm12',
        thumbnail: '/courses_files/canes/61OGkjCMNvL.jpg',
        type: 'scorm12',
    
    },
    {
        id: 'scorm-1',
        name: 'Scorm-1',
        url: '/courses_files/scorm-1/index.html',
        type: 'scorm12',
        thumbnail: '/courses_files/scorm-1/scorm-img1.png',
        type: 'scorm12',
    
    },
    {
        id: 'flores',
        name: 'Flores',
        url: '/courses_files/flores/index.html',
        type: 'scorm12',
        thumbnail: '/courses_files/flores/1.jpg',
        type: 'scorm12',
    
    },
    {
        id: 'scorm2',
        name: 'Scorm2',
        url: '/courses_files/scorm2/index.html',
        type: 'scorm12',
        thumbnail: '/courses_files/scorm-1/panel-amusements.png',
        type: 'scorm12',
    
    },
];

export const getCourse = (courseId) => courses.find(course => course.id === courseId)
