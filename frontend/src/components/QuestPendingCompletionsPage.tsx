import { useParams } from 'react-router-dom';
import QuestPendingCompletions from './QuestPendingCompletions';

const QuestPendingCompletionsPage = () => {
  const { questId } = useParams<{ questId: string }>();

  if (!questId) {
    return <div>Quest ID is required</div>;
  }

  return <QuestPendingCompletions questId={parseInt(questId, 10)} />;
};

export default QuestPendingCompletionsPage;
