import React from 'react';
import { Result } from 'antd';
import { Loading3QuartersOutlined } from '@ant-design/icons';
import { isEmpty as _isEmpty } from 'lodash-es';
import NoInsights from '../../assets/images/search_data.svg';
import ErrorInInsights from '../../assets/images/no-data-found.svg';
import NoComments from '../../assets/images/no-comments.svg';
import Empty from 'assets/images/empty.svg';
import './SMResult.scss';

const SMResult = props => {
  const { type, message, size, component, forChart, isTabCardHead, noMargin = false } = props;

  if (!_isEmpty(type)) {
    // --- Loader type :: apiFailure or Seller Center login
    if (type === 'apiFailure' || type === 'login') {
      return (
        <div className={`c-notifiContainer ${size ? size : ''} ${forChart ? 'forChart' : ''} ${noMargin ? 'm0' : ''}`}>
          <Result
            icon={<img src={Empty} alt='error' className='notifi_icon' />}
            title={!_isEmpty(message) && <span className='notifi_message'>{message}</span>}
            {...props}
          />
          <div style={{ marginTop: '24px' }}>{!_isEmpty(component) && component}</div>
        </div>
      );
    }

    // --- Loader type :: Loading
    if (type === 'loader') {
      return (
        <div
          className={`c-notifiContainer ${size ? size : ''} ${forChart ? 'forChart' : ''} ${noMargin ? 'm0' : ''} ${
            isTabCardHead ? 'isTabCardHead' : ''
          }`}
        >
          <Result
            icon={<Loading3QuartersOutlined className='notifi_spinner' spin />}
            title={!_isEmpty(message) && <span className='notifi_message'>{message}</span>}
            {...props}
          />
        </div>
      );
    }

    // --- Loader type :: Blank / Empty data
    //! TC-14000::icon has img element is passed due to it was breaking
    if (type === 'empty') {
      return (
        <div
          className={`c-notifiContainer container-type-empty ${size ? size : ''} ${forChart ? 'forChart' : ''} ${
            noMargin ? 'm0' : ''
          }`}
        >
          <Result
            icon={
              <img
                src={message === 'No comments' ? NoComments : NoInsights}
                alt='empty'
                className={`notifi_icon ${message === 'No comments' ? 'mb-2' : ''}`}
              />
            }
            title={!_isEmpty(message) && <span className='notifi_message'>{message}</span>}
            {...props}
          />
          {!_isEmpty(component) && component}
        </div>
      );
    }

    // --- Loader type :: error
    if (type === 'error') {
      return (
        <div className={`c-notifiContainer ${size ? size : ''} ${forChart ? 'forChart' : ''} ${noMargin ? 'm0' : ''}`}>
          <Result
            icon={<img src={ErrorInInsights} alt='empty' className={`notifi_icon`} />}
            title={!_isEmpty(message) && <span className='notifi_message'>{message}</span>}
            {...props}
          />
          {!_isEmpty(component) && component}
        </div>
      );
    }
  }

  //   --- Else Return Spinner
  return <Result icon={<Loading3QuartersOutlined className='spinner' spin />} />;
};

export default SMResult;
