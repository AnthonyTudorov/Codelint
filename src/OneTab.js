import React, { useState, useEffect } from 'react';
import parse from 'html-react-parser';
import { v4 as uuidv4 } from 'uuid';
import Top from './Top';
import Editor from './Editor';
import GithubOauth from './GithubOauth';
import Socket from './Socket';
import './styles.css';

export default function OneTab({index, currentTab, updateUser, updateLoggedIn}) {
  const [code, setCode] = useState(localStorage.getItem(`code${index}` || ''));
  const [linter, setLinter] = useState(localStorage.getItem(`linter${index}`) || '');
  const [promptError, setPromptError] = useState('');
  const [loading, setLoading] = useState(false);
  const [repos, setRepos] = useState([]);
  const [allRepoInfo, setAllRepoInfo] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [repoTree, setRepoTree] = useState([]);
  const [repoTreeFiles, setRepoTreeFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [styleguide, setStyleguide] = useState(localStorage.getItem(`styleguide${index}`) || '')

  useEffect(() => {
    Socket.emit('is logged in');

    Socket.on('logged in status', ({ logged_in, user_info}) => {
      if (logged_in === true) {
        console.log("logged in status")
        updateUser(user_info['login'])
        updateLoggedIn(true)
        Socket.emit('get repos');
      }
      else {
        updateLoggedIn(false)
      }
    });

    Socket.on('user data', ({ login }) => {
      updateUser(login)
      updateLoggedIn(true)
      Socket.emit('get repos');
    });

    Socket.on('repos', ({ repos }) => {
      setRepos(repos.map(([elem]) => elem));
      setAllRepoInfo(repos);
    });

    Socket.on('repo tree', (data) => {
      setRepoTree(data);
      const arr = [];
      data.tree.forEach(({ path, type }) => {
        if (type === 'blob') arr.push(path);
      });
      setRepoTreeFiles(arr);
    });

    Socket.on('file contents', (data) => {
      setCode(data.contents);
    });

    Socket.on('output', ({ linter, output, tab }) => {
      setLoading(false);
      setErrors(parse(output));
       console.log(`errors${tab}`)
      localStorage.setItem(`errors${tab}`, output)
    });

     Socket.on('fixed', ({ linter, output, file_contents, tab }) => {
      setLoading(false);
      setCode(file_contents)
      localStorage.setItem(`code${index}`, file_contents);
      setErrors(parse(output));
      console.log(`errors${tab}`)
      localStorage.setItem(`errors${tab}`, output)
    });

    window.history.replaceState({}, document.title, '/');

    return () => {
      Socket.close();
    };
  }, []);

  const handleChange = (newValue) => {
    setCode(newValue);
    localStorage.setItem(`code${index}`, newValue);
  };

  const handleClick = () => {
    if (linter === '') {
      setPromptError('Please select a linter!');
      return;
    }
    if (styleguide === '') {
      setPromptError('Please select a style guide!');
      return;
    }
    setLoading(true);
    Socket.emit('lint', {
      code,
      linter,
      uuid: uuidv4(),
      styleguide,
      index
    });
  };

  const handleLinter = ({ value }) => {
    setLinter(value);
    localStorage.setItem(`linter${index}`, value);
    setPromptError('');
  };

  const handleSelectedRepo = ({ value }) => {
    setSelectedRepo(value);
    allRepoInfo.forEach(([repo_name, url, default_branch]) => {
      if (value === repo_name) {
        if (url.includes(user)) {
          console.log(default_branch);
          Socket.emit('get repo tree', {
            repo_url: url,
            default_branch: default_branch,
          });
        }
      }
    });
  };

  const handleRepoTree = ({ value }) => {
    setSelectedFile(value);
    repoTree.tree.forEach(({ path, url }) => {
      if (path === value) {
        Socket.emit('get file contents', {
          content_url: url,
        });
        if (value.includes('.py')) setLinter('pylint');
        if (value.includes('.js') || value.includes('.jsx')) setLinter('eslint');
      }
    });
  };

  const handleFix = () => {
     if (linter === '') {
      setPromptError('Please select a linter!');
      return;
     }
     if (styleguide === '') {
      setPromptError('Please select a style guide!');
      return;
    }
    setLoading(true);
    Socket.emit('lint', {
      code,
      linter,
      uuid: uuidv4(),
      fix: true,
      styleguide,
      index
    });
  }

  const handleStyleguide = ({ value }) => {
    setStyleguide(value)
    localStorage.setItem(`styleguide${index}`, value);
    setPromptError('');
  }

  const element = () => {
    return (
        <div className="body">
      <Top
        handleSelectedRepo={handleSelectedRepo}
        selectedRepo={selectedRepo}
        handleLinter={handleLinter}
        linter={linter}
        repos={repos}
        handleRepoTree={handleRepoTree}
        repoTreeFiles={repoTreeFiles}
        selectedFile={selectedFile}
        handleStyleguide={handleStyleguide}
        styleguide={styleguide}
        loading={loading}
      />

      <div className={loading ? ""
          : "div-error"}>
        <p className="error">{promptError}</p>
      </div>

      <Editor
        handleChange={handleChange}
        code={code}
      />
      <button type="submit" className="lintbutton" onClick={handleClick}>Lint!</button>
      <button type="submit" className="lintbutton" onClick={handleFix}>Fix!</button>

      <br />
          { currentTab === index ? <div className="code">
        {localStorage.getItem(`errors${index}`) ? parse(localStorage.getItem(`errors${index}`)) : null}
      </div> : null}
    </div>
    );
  }

  return (
      <>
        {currentTab === index ? element() : null}
      </>
  );
}
