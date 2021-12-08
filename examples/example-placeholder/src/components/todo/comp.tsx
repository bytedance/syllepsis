import './comp.less';

import cs from 'classnames';
import React, { useRef, useState, useImperativeHandle } from 'react';

import { ColumnIcon, DeleteIcon, GridIcon } from './icon';

interface ILazyProps {
    data: any,
    editor: any,
    update: (data: any) => void,
}

interface ITodoProps {
    done: boolean,
    text: string,
}

const enum QUADRANT_TYPE {
    FIRST = 'first',
    SECOND = 'second',
    THIRD = 'third',
    FORTH = 'forth',
}

interface IQuadrantProps {
    data: any,
    type: QUADRANT_TYPE,
    placeholder: string,
    onChange: (data, type) => void
}

interface ITodoListProps {
    text: string,
    done: boolean,
    onClick: () => void,
    onDelete: () => void,
}

interface ITodoWrapperProps {
    className?: string,
    defaultDone: boolean,
    data: any,
    change: (data: ITodoProps, value: boolean, isDelete?: boolean) => void,
}

const TodoList = (props: ITodoListProps) => {
    const { text, done, onClick, onDelete } = props;
    return <li className={cs('list', { 'done': done } )}>
        <span className={'checkbox'} onClick={onClick}/>
        <span className={'text'}>{ text }</span>
        <button className="delete" onClick={onDelete}>
            <DeleteIcon/>
        </button>
    </li>
}

const TodoWrapper = (props: ITodoWrapperProps) => {
    const { defaultDone, data, className, change } = props;
    return <ul className={cs('todo-wrapper', className)}>
        {
            data.map((eachTodo, index) => <TodoList key={index} text={eachTodo.text} done={defaultDone} onClick={
                    () => change(eachTodo, !defaultDone)
                } onDelete={
                    () => change(eachTodo, !defaultDone, true)
                }/>)
        }
    </ul>
}

const Quadrant = (props: IQuadrantProps) => {

    const { type, placeholder, onChange, data = { todo: [], done: [] } } = props;
    const { todo, done } = data;

    const inputRef = useRef(null);

    const update = (todo, done) => {
        onChange({ todo: [...todo], done: [...done] }, type);
    }

    const change = (data: ITodoProps, value: boolean, isDelete: boolean) => {
        const deleteData = value === true ? todo : done;
        const appendData = value === true ? done : todo;
        const index = deleteData.indexOf(data);
        const changeData = deleteData.splice(index, 1);
        // 假如是Delete，则不需要变换状态
        if (isDelete !== true) {
            appendData.push(changeData[0]);
        }
        update(todo, done);
    }

    const handleEnter = (event) => {
        if (event.keyCode === 13) {
            const value = inputRef.current.value;
            inputRef.current.value = null;
            const nextTodo = [{ done: false, text: value }, ...todo];
            update(nextTodo, done);
            event.preventDefault();
        }
    }

    return (<div className={cs('quadrant', type)}>
        <input className={'input'} ref={inputRef}
               placeholder={placeholder} onKeyDown={handleEnter}/>
        { todo.length > 0 && <TodoWrapper defaultDone={false} data={todo} change={change} /> }
        { done.length > 0 && <TodoWrapper defaultDone={true} data={done} change={change} /> }
    </div>);
}

const DateComp = () => {
    const now = new Date();
    const week = now.getDay();
    const month = now.getMonth();
    const date = now.getDate();
    const str = ['一', '二', '三', '四', '五', '六', '日'];
    return <div className={'date'}>
        <span>{` ${month} / ${date} `}</span>
        <span>{ '星期' + str[week - 1] }</span>
    </div>
}

const Todo = React.forwardRef((props: ILazyProps, ref) => {
    const { data, update } = props;
    const [isColumn, setIsColumn] = useState(false);
    const todoData = data;

    useImperativeHandle(ref, () => ({}));

    const changeData = (data, type) => {
        todoData[type] = data;
        update(todoData);
    }

    return <div className={cs('todo-quadrant', { 'column': isColumn })}>
        <div className="tool-bar">
            <DateComp/>
            <div className={'button-group'}>
                <button className={cs({ 'is-active': !isColumn })} onClick={() => setIsColumn(false)}><GridIcon/></button>
                <button className={cs({ 'is-active': isColumn })} onClick={() => setIsColumn(true)}><ColumnIcon/></button>
            </div>
        </div>
        <Quadrant data={data[QUADRANT_TYPE.FIRST]} type={QUADRANT_TYPE.FIRST} placeholder={'重要且紧急'} onChange={changeData}/>
        <Quadrant data={data[QUADRANT_TYPE.SECOND]} type={QUADRANT_TYPE.SECOND} placeholder={'重要不紧急'} onChange={changeData}/>
        <Quadrant data={data[QUADRANT_TYPE.THIRD]} type={QUADRANT_TYPE.THIRD} placeholder={'不重要紧急'} onChange={changeData}/>
        <Quadrant data={data[QUADRANT_TYPE.FORTH]} type={QUADRANT_TYPE.FORTH} placeholder={'不重要不紧急'} onChange={changeData}/>
    </div>
});

// eslint-disable-next-line import/no-default-export
export default Todo;
