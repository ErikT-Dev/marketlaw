import React, { useMemo } from 'react';
import { Menu, MenuOptions, MenuOption, MenuTrigger, renderers } from 'react-native-popup-menu';
import { Text, View, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { PlayerStats } from '../../../store/interfaces/playerStats';
import { completeAProject } from '../../../store';
import GameIcon from '../../Icons/GameIcon';
import { Project } from '../../../store/interfaces/project';
import { TypeValues } from '../../../store/interfaces/gameTypes';
import { MenuOptionsCustomStyle } from 'react-native-popup-menu';

interface ProjectOptionProps {
    project: Project;
    onSelect: () => void;
    color: string;
}

const ProjectOption: React.FC<ProjectOptionProps> = ({ project, onSelect, color }) => (
    <MenuOption onSelect={onSelect} disabled={project.complete}>
        <View style={[styles.projectOption, { backgroundColor: color }]}>
            <Text style={styles.projectText}>{project.projectName}</Text>
            <Text style={styles.projectText}> - Pay 8 </Text>
            <GameIcon includePopup={false} stat={project.costType as TypeValues} />
        </View>
    </MenuOption>
);

export default function ProjectsButton() {
    const playerStats = useSelector((state: { playerStats: PlayerStats }) => state.playerStats);
    const dispatch = useDispatch();

    const allProjectsComplete = useMemo(() =>
        playerStats.projects.every(project => project.complete),
        [playerStats.projects]);

    const projectsData = useMemo(() => [
        { ...playerStats.projects[0], color: '#b8e0a4' },
        { ...playerStats.projects[1], color: '#bc97db' },
        { ...playerStats.projects[2], color: '#d199bc' },
    ], [playerStats.projects]);

    const menuOptionsStyles: MenuOptionsCustomStyle = {
        optionsContainer: {
            width: '45%',
            padding: 10,
            backgroundColor: '#265939',
            borderRadius: 10,
            borderWidth: 1,
            borderColor: 'black',
        },
        optionsWrapper: {
            padding: 1,
            marginVertical: 4,
        },
    };

    return (
        <Menu style={styles.menu} renderer={renderers.SlideInMenu}>
            <MenuTrigger>
                <View style={[styles.triggerButton, { backgroundColor: allProjectsComplete ? '#392a4a' : '#339657' }]}>
                    <Text adjustsFontSizeToFit numberOfLines={1} style={styles.triggerText}>PROJECTS</Text>
                </View>
            </MenuTrigger>
            <MenuOptions customStyles={menuOptionsStyles}>
                <MenuOption disabled>
                    <Text style={styles.infoText}>• To complete any of the projects you must pay its cost and your workforce, quality and satisfaction must be 0 or higher.</Text>
                    <Text style={styles.infoText}>• The reward for completing any of the projects is that you gain 1 income, draw a random card and gain 2 funds.</Text>
                    <Text style={styles.infoText}>• When completing all 3 projects you're rewarded with an additional 1 income, 1 random card and 2 funds.</Text>
                </MenuOption>
                {projectsData.map((project, index) => (
                    !project.complete && (
                        <ProjectOption
                            key={index}
                            project={project}
                            onSelect={() => dispatch(completeAProject(project))}
                            color={project.color}
                        />
                    )
                ))}
                {allProjectsComplete && (
                    <MenuOption disabled>
                        <View style={[styles.projectOption, { backgroundColor: '#f5d798' }]}>
                            <Text style={styles.projectText}>All done! Now, to win the game get your income to 22.</Text>
                        </View>
                    </MenuOption>
                )}
            </MenuOptions>
        </Menu>
    );
}

const styles = StyleSheet.create({
    menu: { alignSelf: "flex-start", height: '7%' },
    triggerButton: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'black',
        paddingVertical: 5,
        paddingHorizontal: 5,
        marginTop: 0,
        marginLeft: 5,
        height: 38
    },
    triggerText: { fontSize: 13, color: 'white', fontWeight: "600" },
    infoText: { fontSize: 15, color: 'white', fontWeight: "400" },
    projectOption: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: "row",
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'black',
        paddingVertical: 5,
    },
    projectText: { fontSize: 14, color: 'black', fontWeight: "500" },
});