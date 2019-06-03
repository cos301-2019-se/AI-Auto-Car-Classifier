import UploadImage from './UploadImage.ksx';
import { shallow } from 'enzyme';
import React from 'react';

describe('UploadImage', () => {
    it('Should render', () => {
        const wrapper = shallow(null);
        expect(wrapper).toBeNull();
    });
    it('Should render with no props', () => {
        const wrapper = shallow(<UploadImage/>);
        expect(wrapper).toBeNull();
    });
    it('Should render', () => {
        const wrapper = shallow('');
        expect(wrapper).toBeNull();
    });
    it('Should render with props', () => {
        const wrapper = shallow(<UploadImage/>);
        expect(wrapper).not.toBeNull();
    });
});