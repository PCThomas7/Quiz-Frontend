import { useState } from 'react';
import TagManager from '../components/admin/TagManager/TagManager';
import { QuestionCreator } from '../components/admin/QuestionCreator/QuestionCreator';
import { QuestionList } from '../components/admin/QuestionList/QuestionList';
import { QuestionBulkUploader } from '../components/admin/QuestionBulkUploader/QuestionBulkUploader';
import { QuizBuilder } from '../components/admin/QuizBuilder/QuizBuilder';
import { QuizList } from '../components/admin/QuizList/QuizList';
import { QuizTaker } from '../components/admin/QuizTaker/QuizTaker';
import { Question, Quiz, TagSystem, DifficultyLevel, QuestionType } from '../types/types';
import { Toaster } from 'react-hot-toast';
import { Outlet } from 'react-router-dom';
import { AdminLayout } from '../components/layouts/AdminLayout';

export default function QuizDashboard() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
