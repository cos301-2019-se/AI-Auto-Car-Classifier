import ResultComponent from './ResultComponent.jsx';
import { shallow } from 'enzyme';
import React from 'react';

describe('ResultComponent', () => {
    it('Should render', () => {
        const wrapper = shallow(<ResultComponent/>);
        expect(wrapper).not.toBeNull();
    });
    it('Should render with props', () => {
        const wrapper = shallow(<ResultComponent image="resultImmage:"/>);
        expect(wrapper).not.toBeNull();
    });
    it('Should Not render', () => {
        const wrapper = shallow(null);
        expect(wrapper).not.toBeNull();
    });
    it('Should render with faults', () => {
        const wrapper = shallow('');
        expect(wrapper).not.toBeNull();
    });
});