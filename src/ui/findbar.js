'use strict';

console.log('🔥 FINDBAR.JS IS LOADING! 🔥');

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import IconChevronDown from '../../res/icons/20/chevron-down.svg';
import IconChevronUp from '../../res/icons/20/chevron-up.svg';
import IconPlus from '../../res/icons/20/plus.svg';

function Findbar({ searchState, active }) {
	const intl = useIntl();
	const [showReplace, setShowReplace] = useState(false);
	const [findValue, setFindValue] = useState('');
	const [replaceValue, setReplaceValue] = useState('');
	const searchInputRef = useRef();
	const replaceInputRef = useRef();

	const handleKeydownCallback = useCallback(handleKeydown, []);

	useEffect(() => {
		window.addEventListener('keydown', handleKeydownCallback);
		return () => {
			window.removeEventListener('keydown', handleKeydownCallback);
		};
	}, [handleKeydownCallback]);

	function handleKeydown(event) {
		if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
			event.preventDefault();
			event.stopPropagation();
			searchState.setActive(true);
			setTimeout(() => {
				searchInputRef.current?.focus();
				searchInputRef.current?.select();
			});
		}
	}

	useEffect(() => {
		if (active) {
			setTimeout(() => {
				if (searchInputRef.current) {
					searchInputRef.current.focus();
					searchInputRef.current.select();
				}
			}, 100);
		}
	}, [active]);

	function handleMouseDown(event) {
		if (event.target.nodeName !== 'INPUT') {
			event.preventDefault();
		}
	}

	function handleFindPrev() {
		searchState.prev();
	}

	function handleFindNext(event) {
		searchState.next();
	}

	function handleReplace() {
		searchState.replace(replaceValue);
	}

	function handleReplaceAll() {
		searchState.replaceAll(replaceValue);
	}

	function handleFindInputChange(event) {
		setFindValue(event.target.value);
		searchState.setSearchTerm(event.target.value);
	}

	function handleReplaceInputChange(event) {
		setReplaceValue(event.target.value);
	}

	function handleFindInputKeyDown(event) {
		if (event.key === 'Escape') {
			searchState.setActive(false);
		}
		else if (event.key === 'Enter' && event.shiftKey) {
			handleFindPrev();
			event.preventDefault();
		}
		else if (event.key === 'Enter' && !event.shiftKey) {
			handleFindNext();
			event.preventDefault();
		}
	}

	function handleReplaceInputKeyDown(event) {
		if (event.key === 'Escape') {
			searchState.setActive(false);
		}
		else if (event.key === 'Enter') {
			handleReplace();
		}
		else if (event.key === 'ArrowUp') {
			handleFindPrev();
			event.preventDefault();
		}
		else if (event.key === 'ArrowDown') {
			handleFindNext();
			event.preventDefault();
		}
	}

	function handleReplaceCheckboxChange() {
		if (!showReplace) {
			setTimeout(() => {
				replaceInputRef.current.focus();
			});
		}
		setShowReplace(!showReplace);
	}

	function handleMakeHighlightsPermanent() {
		console.log('=== MAKE HIGHLIGHTS PERMANENT CLICKED ===');
		console.log('searchState:', searchState);
		console.log('searchState.results:', searchState.results);
		
		// Get the current search term
		const searchTerm = searchState.searchTerm;
		if (!searchTerm || !searchTerm.trim()) {
			console.log('No search term found');
			return;
		}

		console.log('Search term:', searchTerm);

		// Get the note editor element 
		const editorElement = document.querySelector('.ProseMirror');
		if (!editorElement) {
			console.log('No ProseMirror editor found');
			return;
		}

		console.log('Found editor element:', editorElement);

		// Create a regex to find the search term
		const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
		
		// Walk through text nodes and add highlights
		const walker = document.createTreeWalker(
			editorElement,
			NodeFilter.SHOW_TEXT,
			null,
			false
		);

		const textNodes = [];
		let node;
		while (node = walker.nextNode()) {
			if (node.textContent && regex.test(node.textContent)) {
				textNodes.push(node);
			}
		}

		console.log('Found text nodes to highlight:', textNodes.length);

		// Add highlights to matching text nodes
		textNodes.forEach(textNode => {
			if (textNode.textContent && regex.test(textNode.textContent)) {
				const parent = textNode.parentNode;
				const highlightedContent = textNode.textContent.replace(regex, '<span style="background-color: #ffd400; font-weight: bold;">$1</span>');
				
				const wrapper = document.createElement('div');
				wrapper.innerHTML = highlightedContent;
				
				while (wrapper.firstChild) {
					parent.insertBefore(wrapper.firstChild, textNode);
				}
				parent.removeChild(textNode);
			}
		});

		console.log('Highlighting complete');
	}

	// Debug logging
	console.log('=== FINDBAR RENDER DEBUG ===');
	console.log('active:', active);
	console.log('searchState:', searchState);
	console.log('searchState.results:', searchState?.results);
	console.log('searchState.results.length:', searchState?.results?.length);
	console.log('searchState.searchTerm:', searchState?.searchTerm);
	const hasResults = searchState.results && searchState.results.length > 0;
	const hasSearchTerm = searchState.searchTerm && searchState.searchTerm.trim();
	console.log('hasResults:', hasResults);
	console.log('hasSearchTerm:', hasSearchTerm);

	return active && (
		<div className="findbar" onMouseDown={handleMouseDown}>

			<input
				ref={searchInputRef}
				type="text"
				placeholder={intl.formatMessage({ id: 'noteEditor.find' })}
				value={searchState.searchTerm || ''}
				onChange={handleFindInputChange} onKeyDown={handleFindInputKeyDown}
			/>

			<div className="buttons">
				<div className="group">
					<button
						className="toolbar-button" onClick={handleFindPrev}
						title={intl.formatMessage({ id: 'noteEditor.previous' })}
					>
						<IconChevronUp/>
					</button>
					<button
						className="toolbar-button" onClick={handleFindNext}
						title={intl.formatMessage({ id: 'noteEditor.next' })}
					>
						<IconChevronDown/>
					</button>
				</div>
				<div className="check-button">
					<input type="checkbox" id="replace-checkbox" checked={showReplace}
						   onChange={handleReplaceCheckboxChange}/>
					<label htmlFor="replace-checkbox"><FormattedMessage id="noteEditor.replace"/></label>
				</div>
				{hasSearchTerm && (
					<button
						className="toolbar-button"
						onClick={handleMakeHighlightsPermanent}
						title={intl.formatMessage({ id: 'noteEditor.makeHighlightsPermanent', defaultMessage: 'Make highlights permanent' })}
					>
						<IconPlus/>
					</button>
				)}
			</div>

			{showReplace && <React.Fragment>
				<input
					ref={replaceInputRef}
					type="text"
					placeholder={intl.formatMessage({ id: 'noteEditor.replace' })}
					value={replaceValue}
					onChange={handleReplaceInputChange}
					onKeyDown={handleReplaceInputKeyDown}
				/>
				<div className="buttons">
					<button className="text-button" onClick={handleReplace}>
						<FormattedMessage id="noteEditor.replaceNext"/>
					</button>
					<button className="text-button" onClick={handleReplaceAll}>
						<FormattedMessage id="noteEditor.replaceAll"/>
					</button>
				</div>

			</React.Fragment>}
		</div>
	);
}

export default Findbar;
