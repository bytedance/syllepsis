import './comp.less';

import React from 'react';

interface ICatData {
  avatar: string,
  name: string,
  phone: string,
  role: string,
  desc: string,
}

interface ILazyProps {
  data: ICatData,
  editor: any,
  update: (data: any) => void,
  onFocus?: () => void,
  onBlur?: () => void,
}

const Cat = React.forwardRef((props: ILazyProps, ref) => {
  const { data } = props;
  const { avatar, name, phone, role, desc } = data;

  return (
    <div className='info-card'>
      <div className='bg'>
        <div className='bg-1' />
      </div>
      <div className='info-wrapper'>
        <div className='avatar'
             style={{ backgroundImage: `url(${avatar})` }} />
        <div className='self-info'>
          <label className='name'>{name}</label>
          <label className='split'>/</label>
          <label className='role'>{role}</label>
          <br />
          <label className='phone'>{phone}</label>
          <label className='desc'>{desc}</label>
        </div>
      </div>
    </div>
  );
});

// eslint-disable-next-line import/no-default-export
export default Cat;
