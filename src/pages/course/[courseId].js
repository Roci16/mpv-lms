import { useEffect, useState } from 'react';
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

    const buildCourseUrl = (url) => `/courses_files/${courseId}/${url}`;

    const getResourceByItem = (resourceId) => courseData.resources.resource.filter((r) => r.identifier === resourceId)[0];

    function renderItems(items) {
        return items.map((item) => (
            <>
                <button
                    className='my-2 px-3 py-1 rounded bg-slate-50 hover:bg-slate-500 hover:text-slate-50'
                    onClick={() => setResource(buildCourseUrl(getResourceByItem(item.identifierref).href))}>
                    {item.title}
                </button>
                {item.items?.length > 0 && renderItems(item.items)}
            </>
        ));
    }

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
            if (usersCMI) window.API.loadFromJSON(JSON.parse(usersCMI).cmi);
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
            //console.log("Initial objective status: " + initialObjectiveStatus);
            setObjetives(initialObjectiveStatus);

            window.API.on('LMSSetValue.cmi.objectives.*', function (CMIElement, value) {
                //console.log("Objective status: " + value);
                const cmiPath = CMIElement.split('.');
                const key = cmiPath[cmiPath.length - 1]
                console.log('path', cmiPath)
                setObjetives(obj => ({ ...obj, [key]: value}));
                window.API.storeData(true);
                //console.log(window.API.renderCommitCMI(true));
            });

        }
    }, [])

    function updateObjectiveStatus(objectiveIndex, id, minScore, maxScore, score, status) {
        if (!window || !window.API) {
          console.log("updateObjectiveStatus debe estar en el useEffect");
          return;
        }
      
        window.API.LMSSetValue("cmi.objectives." + objectiveIndex + ".id", id);
                window.API.LMSSetValue("cmi.objectives." + objectiveIndex + ".score.min", minScore);
        window.API.LMSSetValue("cmi.objectives." + objectiveIndex + ".score.max", maxScore);
        window.API.LMSSetValue("cmi.objectives." + objectiveIndex + ".score.raw", score);
        window.API.LMSSetValue("cmi.objectives." + objectiveIndex + ".status", status);
      }
      
      useEffect(() => {
        if(lessonStatus === "incomplete"){
            updateObjectiveStatus(0, "Objetivo-nuevo-1", 0, 100, 0, "Incomplete");
        }
        else if (lessonStatus === "complete" || lessonStatus === "completed") {
          updateObjectiveStatus(0, "Objetivo-nuevo-2", 0, 100, 0, "complete");
        }else if(lessonStatus === "passed"){
            updateObjectiveStatus(0, "Objetivo-nuevo-3", 0, 100, 0, "passed");
        }else if(lessonStatus === "failed"){
            updateObjectiveStatus(0, "Objetivo-nuevo-4", 0, 100, 0, "failed");
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
                    <pre>Objectives: {JSON.stringify(objetives, null, 2)}</pre>
                </div>


            </div>

            <div className='flex w-2/3 bg-slate-50 shadow rounded-lg overflow-hidden'>
                <iframe
                    sandbox="allow-scripts allow-forms allow-pointer-lock allow-same-origin"
                    className="w-full h-full"
                    id="course-iframe"
                    src={resource}
                ></iframe>
            </div>

        </div>
    )
}
