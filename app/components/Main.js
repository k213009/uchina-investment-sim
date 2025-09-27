'use client'; 

import React from 'react';
import InputForm from './InputForm';
// ResultsPageとreact-router-domは不要なので削除

function Main() {
  // ページ遷移の機能はNext.jsが自動で行うので、ここではInputFormを直接表示するだけ
  return (
    <>
      <InputForm />
    </>
  );
}

export default Main;