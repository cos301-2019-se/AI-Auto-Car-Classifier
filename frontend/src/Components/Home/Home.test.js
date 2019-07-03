import Home from './Home';
import { shallow } from 'enzyme';
import React from 'react';

describe('Home', () => {
    it('Should render', () => {
        const wrapper = shallow(<Home/>);
        expect(wrapper).not.toBeNull();
    });
    it('Should not render', () => {
        const wrapper = shallow(<Home/>);
        expect(wrapper).not.toBeNull();
    });
    it('Should render with no problem', () => {
        const wrapper = shallow(<Home/>);
        expect(wrapper).not.toBeNull();
    });
});
