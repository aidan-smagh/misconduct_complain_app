"use client";
import React, { useState } from "react";

const About = () => {
  const [openQuestion, setOpenQuestion] = useState(null);

  const toggleQuestion = (index) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  const faqData = [
    {
      question: "What's the collection process of the data?",
      answer:
        "To collect data for our ArcGIS maps regarding police misconduct complaint processes in each municipality, we followed a detailed methodology: We initiated the data collection process by reaching out to each municipality via email. In this email, we specifically requested information pertaining to their police misconduct complaint process. This step aimed to establish initial communication and gather primary data directly from the municipalities. Irrespective of the response received via email, we thoroughly examined the official website of each municipality.",
      answer2:
        "This comprehensive review was conducted to locate any available information regarding  police misconduct complaint processes. We paid special attention to online complaint forms and any relevant documentation such as right to know request forms. If we received a detailed email response, we used the information gathered from the website to complement, enhance, and supplement our dataset. For municipalities that did not respond to our initial email or lacked relevant information on their websites, we proceeded to contact them via telephone.",
      answer3:
        "This direct communication allowed us to obtain necessary data regarding their police misconduct complaint processes. In certain instances, municipalities required us to complete a Right to Know Request Form to access the desired information. Upon receiving such requests, we promptly fulfilled the necessary paperwork to facilitate data acquisition. Our volunteers did much of the work in this step. If despite our efforts, we received no response to our email and phone inquiries, and no information was available on the municipality's website, we classified that municipality as having no data; 34 municipalities had this categorization across all maps below. This categorization was essential to maintain transparency regarding the completeness of our dataset and can be seen in the legends of all maps.",
    },
    {
      question:
        "What typically happens in Allegheny County after a complaint is filed?",
      answer:
        "Out of 131 municipalities in this region, it’s rare that they will tell the complainant who investigates the complaint. Only 32.8 percent tell complainants this information, mostly in a non-specific way. They also rarely commit to making an initial follow-up with complainants, with only 26.7 percent saying that they will. Municipalities in Allegheny County are even less likely to reveal their findings. Only 2.29 percent of municipalities list potential disciplinary actions taken against a law enforcement agent as a result of a complaint, and 9.16 percent say who decides the disciplinary action and whether the complainant will find out about the action that has taken place. Worse, only 2.2 percent of municipalities say that the public will find out about disciplinary actions. Even with a strong initial complaint process scores, municipalities often fail to provide effective next steps. ",
    },
    {
      question: "What do we do after we obtain a complaint form?",
      answer:
        "As our map indicates, many municipalities do not have public data on how easily one can deliver a complaint form to their municipal management. 56 of the municipalities do not have any public information regarding how to deliver a complaint form. 62 of the municipalities did have some semblance of information that can help the public decipher how to deliver a complaint form to management but it is not always complete information. Although it is not always clear, use the resources provided here to contact management and officially file complaint.",
    },
  ];

  return (
    <div className="flex flex-col items-center p-8 bg-white min-h-screen">
      {/* Introduction Section */}
      <div className="text-center max-w-3xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Misconduct Complaint in <br /> Allegheny County
        </h1>
        <div className="bg-gray-200 p-6 rounded-lg shadow-md">
          <p className="text-gray-700 leading-relaxed">
            Each municipality in Allegheny County independently manages the recruitment, training, and oversight of its own police department. While some police departments serve across multiple municipalities, most maintain separate departments. This structure allows police departments to be responsive to local community needs, but also creates challenges in coordinating and communicating services, particularly when it comes to sharing best practices, handling complaints, and ensuring consistent transparency in law enforcement practices. This tool aims to facilitate communication between community members and law enforcement in Allegheny County to help build public trust and accountability.
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16 w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
          FAQ
        </h2>
        {faqData.map((item, index) => (
          <div key={index} className="border-t border-gray-300">
            <button
              className="w-full flex justify-between items-center py-4 text-lg text-gray-800 hover:bg-gray-100"
              onClick={() => toggleQuestion(index)}
            >
              {item.question}
              <span className="text-gray-900">
                {openQuestion === index ? "▲" : "▼"}
              </span>
            </button>
            {openQuestion === index && (
              <div className="p-4 text-gray-600 bg-gray-50">
                {item.answer}
                <br />
                <br />
                {item.answer2}
                <br />
                <br />
                {item.answer3}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default About;
