import { useParams } from 'react-router-dom';
import BulkAssignCompletions from './BulkAssignCompletions';

const BulkAssignCompletionsPage = () => {
  const { questId } = useParams<{ questId: string }>();

  if (!questId) {
    return <div>Quest ID is required</div>;
  }

  return <BulkAssignCompletions questId={parseInt(questId, 10)} />;
};

export default BulkAssignCompletionsPage;
