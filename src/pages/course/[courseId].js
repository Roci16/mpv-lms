import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import axios from 'axios';
import { buildFromXML } from '../../utils/buildFromXML';


const FRONTEND_URL = 'http://localhost:3000';

export const getServerSideProps = async (context) => {
    const courseId = context.params.courseId;
    let objetoNuevo = {};

    try {
        const response = await axios.get(`${FRONTEND_URL}/courses_files/${courseId}/imsmanifest.xml`)
        const data = response.data;
        objetoNuevo = JSON.parse(buildFromXML(data));
    }
    catch (error) {
        console.error('Error:', error);
    }

    return { props: { courseId, courseData: objetoNuevo } }
}


export default function Course({ courseId, courseData }) {
    const [resource, setResource] = useState('#');
    const [lessonStatus, setLessonStatus] = useState("");
    const [lessonLocation, setLessonLocation] = useState("");
    const [sessionTime, setSessionTime] = useState("");
    const [totalTime, setTotalTime] = useState("");
    const [objetives, setObjetives] = useState("");
    const [items, setItems] = useState([]);
    const [title, setTitle] = useState("");

    const [studentPreference, setStudentPreference] = useState({});


    const buildCourseUrl = (url) => `/courses_files/${courseId}/${url}`;

    const getResourceByItem = (resourceId) => courseData.resources.resource.filter((r) => r.identifier === resourceId)[0];

    function renderItems(items) {
        return items.map((item, index) => (
            <React.Fragment key={item.identifier}>
                <button
                    className='my-2 px-3 py-1 rounded bg-slate-50 hover:bg-slate-500 hover:text-slate-50'
                    onClick={() => setResource(buildCourseUrl(getResourceByItem(item.identifierref).href))}>
                    {item.title}
                </button>
                {item.items?.length > 0 && renderItems(item.items)}
            </React.Fragment>

        ));
    }

    //Orgenizacion y Recursos
    useEffect(() => {
        const organizations = courseData.organizations;
        const organization = organizations?.organization;
        const firstOrganization = organization?.[0];
        const courseTitle = firstOrganization?.title;
        const firstOrganizationItems = firstOrganization?.items;
        const firstItemFromFirstOrg = firstOrganizationItems?.[0];
        const resourceIdOfFirstItem = firstItemFromFirstOrg?.identifierref;
        // //console.log(firstItemFromFirstOrg, "FIRRRRRRRRRRRTS")
        setTitle(courseTitle)
        setItems(firstOrganizationItems)

        const resources = courseData.resources;
        const resource = resources?.resource;
        const openingResource = resource?.filter((r) => r.identifier === resourceIdOfFirstItem)[0]  //pueden haber varios resource 
        //console.log("RESOURCEEEEE", openingResource)
        const firsResourceUrl = openingResource?.href;
        setResource(buildCourseUrl(firsResourceUrl))
    }, [])

    useEffect(() => {
        if (typeof window !== "undefined") {
            window.alert = () => { }
            // Cuando existe el window configuramos scorm-again
            window.API = new Scorm12API({
                autocommit: true,
                autocommitSeconds: 5,
                logLevel: 4,
                alwaysSendTotalTime: true
            });

            // Cargar el progreso guardado desde el localStorage
            const usersCMI = localStorage.getItem("cmi");
            if (usersCMI) {
                window.API.loadFromJSON(JSON.parse(usersCMI).cmi);
            }
            window.API.on('LMSInitialize', (...rest) => {
                //console.log('Inicializado el LMS', rest)
            });
            window.API.on('LMSGetLastError', (...rest) => {
                //console.log('LMSGetLastError', rest)
            });
            window.API.on('LMSGetErrorString', (...rest) => {
                //console.log('LMSGetErrorString', rest)
            });
            window.API.on('LMSGetDiagnostic', (...rest) => {
                //console.log('LMSGetDiagnostic', rest)
            });
            // Escucha el evento 'LMSSetValue.cmi.*'
            window.API.on('LMSSetValue.cmi.*', function (CMIElement, value) {
                //console.log('CMIelement', CMIElement);
                window.API.storeData(true);
                localStorage.setItem('cmi', JSON.stringify(window.API.renderCommitCMI(true)));
                //console.log(window.API.renderCommitCMI(true));

                // Comprueba si hay algún error
                /*   const errorCode = window.API.LMSGetLastError();
                  if (errorCode !== "0") {
                      const errorString = window.API.LMSGetErrorString(errorCode);
                      const diagnostic = window.API.LMSGetDiagnostic(errorCode);
                      console.error("SCORM Error: " + errorString + " Diagnostic: " + diagnostic);
                  } else {
                      //console.log("No SCORM error occurred");
                  } */

            });

            /* Valor inexistente para probar detección de errores
            window.API.LMSSetValue("cmi.core.non_existent_element", "some value");  */


            window.API.on('LMSSetValue.cmi.core.lesson_status', function (CMIElement, value) {
                setLessonStatus(value);
                //console.log("Lesson status: " + value);
            });

            window.API.on('LMSSetValue.cmi.core.lesson_location', function (CMIElement, value) {
                setLessonLocation(value);
                //console.log("Lesson location: " + value);
            });

            window.API.on('LMSSetValue.cmi.core.session_time', function (CMIElement, value) {
                setSessionTime(value);
                //console.log("Session time: " + value);
            })


            // Obtener el estado inicial del objetivo
            let initialObjectiveStatus = window.API.LMSGetValue("cmi.objectives");
            setObjetives(initialObjectiveStatus);

            window.API.on('LMSSetValue.cmi.objectives.*', function (CMIElement, value) {
                const cmiPath = CMIElement.split('.');
                const key = cmiPath[cmiPath.length - 1]
                // console.log('path', cmiPath)
                setObjetives(obj => ({ ...obj, [key]: value }));
                window.API.storeData(true);
            });

            //CMI TOTAL TIME
            let initialStudentPreference = {}
            setTimeout(() => {
                initialStudentPreference = window.API.LMSGetValue("cmi.student_preference");
                setStudentPreference(initialStudentPreference);
            }, 1000);

            window.API.on('LMSSetValue.cmi.student_preference.*', function (CMIElement, value) {
                const cmiPath = CMIElement.split('.');
                const key = cmiPath[cmiPath.length - 1]
                //    console.log('path', cmiPath)
                // console.log('Event LMSSetValue.cmi.student_preference triggered');
                setStudentPreference((prevPreference) => ({ ...prevPreference, [key]: value }));
                window.API.storeData(true);
            });

            // Evento LMSInitialize
            window.API.on("LMSInitialize", () => {
                if (window.API.LMSFinish()) {
                    return;
                }
            })
        }
    }, [])


    //Objetivos
    function updateObjectiveStatus(objectiveIndex, id, minScore, maxScore, score, status) {
        if (!window || !window.API) {
            // console.log("updateObjectiveStatus debe estar en el useEffect");
            return;
        }

        window.API.LMSSetValue("cmi.objectives." + objectiveIndex + ".id", id);
        window.API.LMSSetValue("cmi.objectives." + objectiveIndex + ".score.min", minScore);
        window.API.LMSSetValue("cmi.objectives." + objectiveIndex + ".score.max", maxScore);
        window.API.LMSSetValue("cmi.objectives." + objectiveIndex + ".score.raw", score);
        window.API.LMSSetValue("cmi.objectives." + objectiveIndex + ".status", status);
    }

    useEffect(() => {
        if (lessonStatus === "complete" || lessonStatus === "completed") {
            updateObjectiveStatus(0, "Objetivo-nuevo-1", 0, 100, 0, "Completo");
        } else if (lessonStatus === "passed") {
            updateObjectiveStatus(0, "Objetivo-nuevo-2", 0, 100, 0, "Aprobado");
        } else if (lessonStatus === "failed") {
            updateObjectiveStatus(0, "Objetivo-nuevo-3", 0, 100, 0, "Fallido");
        } else if (lessonStatus === "incomplete") {
            updateObjectiveStatus(0, "Objetivo-nuevo-4", 0, 100, 0, "Incompleto");
        }
        else {
            setTimeout(() => {
                updateObjectiveStatus(0, "Objetivo-nuevo-4", 0, 100, 0, "Incompleto")
            }, 1000)
        }
    }, [lessonStatus]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            window.API.on('LMSCommit', function () {
                //console.log("LMSCommit has been called");
                let value = window.API.LMSGetValue("cmi.core.total_time");
                //console.log("Total time: ", value);
                setTotalTime(value);
            });
        }
    }, []);

    // CMI Student Preference
    const updateStudentPreferenceStatus = (preferenceIndex, audio) => {
        if (!window || !window.API) {
            return;
        }

        // Convertir el valor del rango a un número entero
        const audioValue = parseInt(audio, 10);

        // Verificar si el audio debe silenciarse o activarse
        if (audioValue === 0) {
            // Silenciar el audio
            window.API.LMSSetValue('cmi.student_preference.audio', '0');
        } else if (audioValue === 100) {
            // Activar el audio
            window.API.LMSSetValue('cmi.student_preference.audio', '1');
        }

        // Actualizar el estado local del componente
        setStudentPreference((prevPreference) => ({
            ...prevPreference,
            audio: audioValue.toString()
        }));

        // Guardar los datos en el API SCORM
        window.API.storeData(true);
    };




    return (
        <div className='p-5 flex justify-between bg-blue-100 min-h-screen'>
            <Head>
                <title>{title}</title>
                <script type="text/javascript" src="/scorm-again.min.js"></script>
            </Head>

            <div className='p-5'>
                <a href='/' className='my-2 px-3 h-3 py-1 rounded bg-slate-50 hover:bg-slate-500 hover:text-slate-50'>Back</a>
                <h1 className='text-4xl font-bold my-6'>{title}</h1>

                <div className='flex flex-col'>{!!items && !!items.length && !!items[0]?.items?.length && renderItems(items)}</div>

                <div className='mt-4 bg-blue-50'>
                    <h3 className='text-lg font-semibold'>SCORM Data:</h3>
                    <p>Lesson Status: {lessonStatus}</p>
                    <p>Lesson Location: {lessonLocation}</p>
                    <p>Session Time: {sessionTime}</p>
                    <p>Total Time: {totalTime}</p>
                    <h3 className='text-lg font-semibold'>SCORM Objetivos:</h3>
                    <pre>{JSON.stringify(objetives, null, 2)}</pre>
                    <h3 className='text-lg font-semibold'>SCORM Preferencia del Estudiante:</h3>
                    <pre>{JSON.stringify(studentPreference, null, 2)}</pre>


                    <div>
                        <p>Audio: {updateStudentPreferenceStatus.audio}</p>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={updateStudentPreferenceStatus.audio}
                            onChange={(e) =>
                                updateStudentPreferenceStatus(0, e.target.value)
                              }
                        />
                    </div>


                </div>


            </div>

            <div className='flex w-2/3 bg-slate-50 shadow rounded-lg overflow-hidden'>
                <iframe
                    allow="autoplay"
                    sandbox="allow-scripts allow-forms allow-pointer-lock allow-same-origin"
                    className="w-full h-full"
                    id="course-iframe"
                    src={resource}
                ></iframe>
            </div>

        </div>
    )
}
