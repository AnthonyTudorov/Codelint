/* eslint-disable react/prop-types */
import React from 'react';
import 'react-dropdown/style.css';
import './top.css';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dropmenu from './Dropmenu';

export default function Top({
  handleLinter, handleSelectedRepo, linter, repos, handleRepoTree, repoTreeFiles,
  selectedRepo, selectedFile, handleStyleguide, styleguide, loading, changeFontSize, fontSize,
}) {
  return (
    <>
      <div className="top">
        {loading && <CircularProgress />}
        <Dropmenu
          handleDropdown={handleLinter}
          value={linter}
          className="dropdownMain"
          placeholder="Select a linter"
          options={['pylint', 'eslint']}
        />

        {linter === 'eslint'
          ? (
            <Dropmenu
              handleDropdown={handleStyleguide}
              value={styleguide}
              className="dropdownMain"
              placeholder="Select a styling guide"
              options={['airbnb', 'standard', 'google']}
            />
          ) : ''}

        {linter === 'pylint'
          ? (
            <Dropmenu
              handleDropdown={handleStyleguide}
              value={styleguide}
              className="dropdownMain"
              placeholder="Select a styling guide"
              options={['pep8']}
            />
          ) : ''}

        {repos.length !== 0
          ? (
            <Dropmenu
              handleDropdown={handleSelectedRepo}
              value={selectedRepo}
              className="dropdownMain"
              placeholder="Select a repo after GitHub Auth"
              options={repos}
            />
          ) : ''}
        {repoTreeFiles.length !== 0
          ? (
            <div className="files">
              <Dropmenu
                handleDropdown={handleRepoTree}
                value={selectedFile}
                className="allfiles"
                placeholder="Select a file after selecting Repo"
                options={repoTreeFiles}
              />
            </div>
          ) : ''}
      </div>
    </>
  );
}
