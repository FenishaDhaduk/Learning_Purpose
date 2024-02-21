'use client'
import React, { useState } from 'react';

type Props = {
    pdf_url: string;
};

const PDFViewer = ({ pdf_url }: Props) => {
    const [isLoading, setIsLoading] = useState(true);

    const handleLoad = () => {
        setIsLoading(false);
    };

    console.log(`https://docs.google.com/gview?url=${pdf_url}&embedded=true`, "pdfurl");
    
    return (
        <div className='relative w-full h-full'>
            {isLoading && <div className='absolute top-0 left-0 w-full h-full bg-gray-200 flex items-center justify-center'>
                <p>Loading...</p>
            </div>}
            <iframe src={`https://docs.google.com/gview?url=${pdf_url}&embedded=true`} className='w-full h-full' onLoad={handleLoad}></iframe>
        </div>
    );
};

export default PDFViewer;
