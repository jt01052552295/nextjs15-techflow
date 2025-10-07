import { useConfirmModalStore } from '@/store/confirmModal';

export function useConfirm() {
  const { showModal } = useConfirmModalStore();

  const confirm = async (message: string, title?: string) => {
    return await showModal({ message, title });
  };

  return { confirm };
}

/*

// 사용하고자 하는 컴포넌트에서
import { useConfirm } from '@/hooks/useConfirm';

const SomeComponent = () => {
  const { confirm } = useConfirm();
  
  const handleAction = async () => {
    const isConfirmed = await confirm('정말로 실행하시겠습니까?', '확인');
    if (isConfirmed) {
      // 사용자가 확인을 눌렀을 때 실행할 코드
      console.log('확인됨');
    } else {
      // 사용자가 취소를 눌렀을 때 실행할 코드
      console.log('취소됨');
    }
  };
  
  return (
    <button onClick={handleAction}>액션 실행</button>
  );
};

*/
