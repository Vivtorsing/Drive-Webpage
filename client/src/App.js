import React, { useEffect, useState } from 'react';
import './App.css';

const API = 'http://localhost:3001';

export default function App() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [textContent, setTextContent] = useState('');

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    const res = await fetch(`${API}/files`);
    const data = await res.json();
    setFiles(data);
  };

  const uploadFile = async (e) => {
    const formData = new FormData();
    formData.append('file', e.target.files[0]);

    await fetch(`${API}/upload`, {
      method: 'POST',
      body: formData,
    });

    fetchFiles();
  };

  const selectFile = async (name) => {
    if(selectedFile == null) {
      setSelectedFile(name);
      if(name.endsWith('.txt')) {
        const res = await fetch(`${API}/file/${name}`);
        const text = await res.text();
        setTextContent(text);
      }
    } else {
      //is null
      setSelectedFile(null);
    }
  };

  const saveText = async () => {
    await fetch(`${API}/file/${selectedFile}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: textContent }),
    });
    alert('Saved');
  };

  const deleteFile = async (name) => {
    await fetch(`${API}/file/${name}`, {
      method: 'DELETE',
    });
    setSelectedFile(null);
    fetchFiles();
  };

  const createTextFile = async () => {
    const name = prompt('Enter a name for the new text file (e.g., notes.txt)');
    if(!name || !name.endsWith('.txt')) {
      alert('Invalid name. It must end with .txt');
      return;
    }

    const res = await fetch(`${API}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });

    if(res.ok) {
      fetchFiles();
      selectFile(name);
    } else {
      const err = await res.text();
      alert(`Error: ${err}`);
    }
  };

  return (
    <div className="container">
      <h1>My Drive</h1>
      <input type="file" onChange={uploadFile} />
      <button onClick={createTextFile}>➕ Create Text File</button>
      <h2>Files:</h2>
      <ul>
        {files.map((file) => (
          <li key={file}>
            <button onClick={() => selectFile(file)}>{file}</button>
            <button onClick={() => deleteFile(file)}>🗑</button>
          </li>
        ))}
      </ul>
      {selectedFile && (
        <div>
          <h3>Preview: {selectedFile}</h3>
          {selectedFile.endsWith('.txt') ? (
            <div>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={10}
              />
              <br />
              <button onClick={saveText}>💾 Save</button>
            </div>
          ) : (
            <iframe
              src={`${API}/files/${selectedFile}`}
              title="Preview"
            />
          )}
        </div>
      )}
    </div>
  );

}
