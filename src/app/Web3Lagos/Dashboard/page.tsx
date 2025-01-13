"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { ScaleLoader } from "react-spinners";


interface Image {
  id: number;
  picture: string;
}

interface Program {
  id: number;
  name: string;
  description: string;
  venue: string[];
  extra_info: string;
  images: Image[];
  status: boolean;
}

interface ApiResponse {
  success: boolean;
  data: Program[];
}

type FormData = {
  name: string;
  description: string;
  venue: ("online" | "onsite")[]; 
  extra_info: string;
  images: Image[];
  [key: string]: any;
};

type FormErrors = {
  [key in keyof FormData]?: string[];
};

const initialFormState: FormData = {
  name: "",
  description: "",
  venue: [], 
  extra_info: "",
  images: [] 
};

const initialFormErrors: FormErrors = {};



export default function Dashboard() {
  const [formData, setFormData] = useState<FormData>(initialFormState)
      const [errors, setErrors] = useState<FormErrors>(initialFormErrors);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [expandedDescriptionId, setExpandedDescriptionId] = useState<number | null>(null); 
  const [isNewCourseOpen, setIsNewCourseOpen] = useState<boolean>(false); 


  
  useEffect(() => {
    const token = localStorage.getItem("token")
    const fetchPrograms = async () => {
      
      if (!token) {
        setError("You are not logged in");
        setLoading(false);
         window.location.href = "/"
        return;
      }

      try {
        const response = await fetch(
          `https://web3bridgewebsitebackend.onrender.com/api/v2/cohort/course/all/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json(); 

        if (response.ok) {
          setPrograms(data.data); 
        } else {
          setError(`Failed to fetch programs: ${data.message || "Unknown error"}`);
        }
      } catch (error) {
        setError("Error fetching data");
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const toggleDescription = (programId: number) => {
    setExpandedDescriptionId((prev) => (prev === programId ? null : programId)); 
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div> <ScaleLoader /> </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
  
    if (e.target instanceof HTMLInputElement && e.target.type === "checkbox") {
      const checked = e.target.checked;
  
      setFormData((prevData) => {
        const currentValues = Array.isArray(prevData[name])
          ? prevData[name]
          : [];
        if (checked) {
          return {
            ...prevData,
            [name]: [...currentValues, value],
          };
        } else {
          return {
            ...prevData,
            [name]: currentValues.filter((item) => item !== value),
          };
        }
      });
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: undefined,
    }));
  };
  
  
  
  

  const handleChangePic = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
  
    if (files && files[0]) {
      setFormData({
        ...formData,
        [name]: [...formData.images, files[0]], 
      });
    } else {
      setFormData({
        ...formData,
        [name]: [], 
      });
    }
  
    setErrors({
      ...errors,
      [name]: undefined,
    });
  };

  const openandCloseCourse = () => {
    setIsNewCourseOpen((prev) => !prev);
  }
  

  const handleNewCourse = async (e: React.FormEvent) => {
    console.log("clicked")
    e.preventDefault();
    setMessage("");
    setErrors(initialFormErrors); 

    const formDataToSend = {
      ...formData,
    };

    console.log(formDataToSend)
    try {
      const response = await axios.post("https://web3bridgewebsitebackend.onrender.com/api/v2/cohort/course/", formDataToSend)
      const data = response.data
      if (data) {
     setMessage("Course Created succesfully")
    console.log("course created")
    const timer = setTimeout(() => {
      openandCloseCourse();
    }, 3000);
    setFormData(initialFormState);
      } else {
        setMessage("Unable to create Course now. We are working on it")
      }
    } catch (error) {
      console.log(error)
      setMessage("Network error. Please try again later")
    }
  }

  

  return (
    <div className="bg-green-200 w-full h-full p-10">


      <div className="space-y-10">
        <div className="flex justify-between">
        <h1 className="text-center text-3xl font-bold"> {isNewCourseOpen ? "Create New Course" : "All Courses"}</h1>
        <button className="flex justify-end items-center bg-[#2b292c] p-3 rounded-md text-white" onClick={openandCloseCourse}>New Course </button>
        </div>

          {/* New Course Form */}
          {isNewCourseOpen && (
          <div className="bg-white p-6 rounded-md shadow-md mt-4 space-x-5">
            <h2 className="text-2xl font-semibold">Add New Course</h2>
            <form onSubmit={handleNewCourse} className="space-y-6 mt-3">
              <div className="space-y-3">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="border rounded p-2 w-full"
                />
              </div>
              <div className="space-y-3">
                <label>Description</label>
              <p className="border w-full h-[20vh]">  <input type="text" name="description" id="" value={formData.description} onChange={handleChange} className="w-full h-[10vh] outline-none"  /></p>
              </div>

              <div className="space-y-3">
                <label>Extra info</label>
                <input type="text" name="extra_info" id="" value={formData.extra_info} onChange={handleChange} className="border w-full h-[10vh]" />
              </div>

              <div className="space-y-3">
              
                 <label>Select Image</label>
              <input
                type="file" name="images"    id="" onChange={handleChangePic}  className=""/>
                 </div>


        <div className="space-y-5">
          <div className="space-x-2">
          <input
              type="checkbox"
              name="venue"
              value="online"
              id="online"
              onChange={handleChange}
            />
            <label htmlFor="online">Online</label>
          </div>

          <div className="space-x-2">
          <input
              type="checkbox"
              name="venue"
              value="onsite"
              id="onsite"
              onChange={handleChange}
            />
            <label htmlFor="onsite">Onsite</label>
          </div>
          </div>

          <div className="flex justify-between">
          <button type="submit"   className="mt-4 p-3 bg-blue-500 text-white rounded"  > Add Course  </button>
          <button className="mt-2 text-red-500"  onClick={openandCloseCourse} >Cancel </button>
          </div>

          <div className="flex justify-center text-xl">
              {message ? <p>{message}</p> : "" }
              </div>

            </form>
          </div>
        )}

        {/*End of new course form */}















{!isNewCourseOpen && (

  <div>
        {programs.length === 0 ? (
          <p className="text-center">No programs found.</p>
        ) : (
          <div className="flex flex-wrap  gap-10">
            {programs.map((program) => (
              <div
                key={program.id}
                className="bg-white p-4 rounded-md shadow-md  w-[45%] cursor-pointer space-y-3"
                onClick={() => toggleDescription(program.id)} 
              >
                <h2 className="text-xl font-semibold">{program.name}</h2>

                <div
                  className={`
                    transition-all ease-out duration-300 overflow-hidden
                    ${expandedDescriptionId === program.id ? "max-h-screen" : "max-h-24"} 
                    ${expandedDescriptionId === program.id ? "py-4" : "py-2"}
                  `}
                >
                  <p className="text-base  leading-7">
                    {expandedDescriptionId === program.id
                      ? program.description
                      : `${program.description.slice(0, 100)}...`}
                  </p>

                  {program.description.length > 100 && (
                  <button
                    className="text-blue-500 text-sm mt-2"
                    onClick={(e) => {
                      e.stopPropagation(); 
                      toggleDescription(program.id);
                    }}
                  >
                    {expandedDescriptionId === program.id ? "Show less" : "Read more"}
                  </button>
                )}
                </div>

                <p>
                  <strong>Venue:</strong> {program.venue.join(", ")}
                </p>
                <p>
                  <strong>Status:</strong> {program.status ? "Active" : "Inactive"}
                </p>
                <div className="flex gap-2 mt-2">
                  {program.images.map((image) => (
                    <img
                      key={image.id}
                      src={`https://web3bridgewebsitebackend.onrender.com/api/v2/cohort/course/all${image.picture}`}
                      alt={`Image for ${program.name}`}
                      className="w-24 h-24 object-cover rounded"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
    )}

      </div>
    </div>
    
  );
}

